class OutlookService {
  static getMailboxItem() {
    return Office.context.mailbox.item;
  }

  static getFromEmail() {
    return this.getMailboxItem().from.emailAddress;
  }

  static getFromDisplayName() {
    return this.getMailboxItem().from.displayName;
  }

  static getSubject() {
    return this.getMailboxItem().subject;
  }

  static getDateTimeCreated() {
    return this.getMailboxItem().dateTimeCreated;
  }

  static getItemId() {
    return this.getMailboxItem().itemId;
  }

  static getToEmails() {
    return this.getMailboxItem().to;
  }

  static getCcEmails() {
    return this.getMailboxItem().cc || [];
  }

  static getBccEmails() {
    // Note: BCC is not available in Outlook add-ins for security reasons
    // This will return empty array but kept for completeness
    return [];
  }

  static getAttachments() {
    return this.getMailboxItem().attachments || [];
  }

  static getConversationId() {
    return this.getMailboxItem().conversationId;
  }

  static getInternetMessageId() {
    return this.getMailboxItem().internetMessageId;
  }

  static getImportance() {
    return this.getMailboxItem().importance;
  }

  static getSensitivity() {
    return this.getMailboxItem().sensitivity;
  }

  static getCategories() {
    return this.getMailboxItem().categories || [];
  }

  static getEwsUrl() {
    return Office.context.mailbox.ewsUrl;
  }

  static async getCallbackToken() {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.getCallbackTokenAsync({ isRest: true }, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
        } else {
          reject(result.error);
        }
      });
    });
  }

  static async getMailBody() {
    return new Promise((resolve, reject) => {
      this.getMailboxItem().body.getAsync(Office.CoercionType.Html, (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
          resolve(asyncResult.value);
        } else {
          reject(asyncResult.error);
        }
      });
    });
  }

  static async getMailBodyText() {
    return new Promise((resolve, reject) => {
      this.getMailboxItem().body.getAsync(Office.CoercionType.Text, (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
          resolve(asyncResult.value);
        } else {
          reject(asyncResult.error);
        }
      });
    });
  }

  static async getAttachmentDetails() {
    const attachments = this.getAttachments();
    
    // Return attachment metadata with additional token info for backend retrieval
    return attachments.map(attachment => ({
      id: attachment.id,
      name: attachment.name,
      size: attachment.size,
      attachmentType: attachment.attachmentType,
      contentType: attachment.contentType,
      isInline: attachment.isInline,
      contentId: attachment.contentId || null,
      // Add item ID for backend to use with token
      itemId: this.getItemId()
    }));
  }

  static convertToLocalClientTime(date) {
    return Office.context.mailbox.convertToLocalClientTime(date);
  }

  static parseDisplayName() {
    const displayName = this.getFromDisplayName();
    const nameParts = displayName.split(' ');
    return {
      firstname: nameParts[0] || '',
      lastname: nameParts[nameParts.length - 1] || '',
      fullname: displayName,
    };
  }

  static async createCompleteEmailArchiveData(parentId, currentUserId) {
    try {
      const mailboxItem = this.getMailboxItem();
      
      // Get and format datetime properly
      const rawDateTime = this.getDateTimeCreated();
      const localDateTime = this.convertToLocalClientTime(rawDateTime);
      
      // Format datetime as string in ISO format or your preferred format
      const formattedDateTime = this.formatDateTimeForAPI(localDateTime);
      
      const htmlBody = await this.getMailBody();
      const textBody = await this.getMailBodyText();
      
      // Get fresh callback token for this operation
      const callbackToken = await this.getCallbackToken();
      console.log('OutlookService: Fresh callback token obtained for email archiving');
      
      const attachmentMetadata = await this.getAttachmentDetails();

      // Format email addresses
      const formatEmailAddresses = (emailArray) => {
        if (!emailArray || !Array.isArray(emailArray)) return [];
        return emailArray.map(email => ({
          emailAddress: email.emailAddress,
          displayName: email.displayName
        }));
      };

      return {
        // Basic email information
        messageId: this.getItemId(),
        internetMessageId: this.getInternetMessageId(),
        conversationId: this.getConversationId(),
        subject: this.getSubject(),
        dateTimeCreated: formattedDateTime,
        dateTimeCreatedRaw: rawDateTime.toISOString(), // Backup in ISO format
        
        // Sender information
        from: {
          emailAddress: this.getFromEmail(),
          displayName: this.getFromDisplayName()
        },
        
        // Recipients
        to: formatEmailAddresses(this.getToEmails()),
        cc: formatEmailAddresses(this.getCcEmails()),
        bcc: formatEmailAddresses(this.getBccEmails()), // Will be empty due to security restrictions
        
        // Email content
        bodyHtml: htmlBody,
        bodyText: textBody,
        
        // Email properties
        importance: this.getImportance(),
        sensitivity: this.getSensitivity(),
        categories: this.getCategories(),
        
        // Attachments
        attachments: attachmentMetadata,
        hasAttachments: attachmentMetadata.length > 0,
        
        // CRM related data
        assigned_user_id: currentUserId,
        parent_id: parentId,
        source: 'Outlook Addon',
        
        // Technical data for API access
        callbackToken: callbackToken,
        ewsUrl: this.getEwsUrl(),
        restUrl: Office.context.mailbox.restUrl,
        
        // Add user identity token for additional authentication if needed
        userIdentityToken: await this.getUserIdentityToken(),
        
        // Legacy fields for backward compatibility
        from_email: this.getFromEmail(),
        description: htmlBody,
        saved_toid: this.getToEmails()[0]?.emailAddress || '',
        messageid: this.getItemId(),
        
        // Additional formatted timestamps
        createdDate: this.formatDateOnly(localDateTime),
        createdTime: this.formatTimeOnly(localDateTime),
        timestamp: Math.floor(Date.now() / 1000) // Unix timestamp
      };
    } catch (error) {
      console.error('Error creating email archive data:', error);
      throw error;
    }
  }

  static formatDateTimeForAPI(dateTimeObj) {
    try {
      if (!dateTimeObj) return '';
      
      // If it's already a string, return as is
      if (typeof dateTimeObj === 'string') return dateTimeObj;
      
      // If it's a Date object, format it
      if (dateTimeObj instanceof Date) {
        // Format as YYYY-MM-DD HH:mm:ss (MySQL/SQL Server format)
        const year = dateTimeObj.getFullYear();
        const month = String(dateTimeObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateTimeObj.getDate()).padStart(2, '0');
        const hours = String(dateTimeObj.getHours()).padStart(2, '0');
        const minutes = String(dateTimeObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateTimeObj.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      
      // If it's an Outlook datetime object with properties
      if (dateTimeObj && typeof dateTimeObj === 'object') {
        // Handle Outlook's datetime object structure
        const date = new Date(
          dateTimeObj.year || dateTimeObj.getFullYear?.() || new Date().getFullYear(),
          (dateTimeObj.month || dateTimeObj.getMonth?.() || 0) - (dateTimeObj.month ? 1 : 0),
          dateTimeObj.day || dateTimeObj.getDate?.() || 1,
          dateTimeObj.hour || dateTimeObj.getHours?.() || 0,
          dateTimeObj.minute || dateTimeObj.getMinutes?.() || 0,
          dateTimeObj.second || dateTimeObj.getSeconds?.() || 0
        );
        
        return this.formatDateTimeForAPI(date);
      }
      
      // Fallback: try to create a Date object
      const fallbackDate = new Date(dateTimeObj);
      if (!isNaN(fallbackDate.getTime())) {
        return this.formatDateTimeForAPI(fallbackDate);
      }
      
      console.warn('OutlookService: Could not format datetime:', dateTimeObj);
      return '';
      
    } catch (error) {
      console.error('OutlookService: Error formatting datetime:', error, dateTimeObj);
      return '';
    }
  }

  static formatDateOnly(dateTimeObj) {
    try {
      if (!dateTimeObj) return '';
      
      const date = dateTimeObj instanceof Date ? dateTimeObj : new Date(dateTimeObj);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('OutlookService: Error formatting date:', error);
      return '';
    }
  }

  static formatTimeOnly(dateTimeObj) {
    try {
      if (!dateTimeObj) return '';
      
      const date = dateTimeObj instanceof Date ? dateTimeObj : new Date(dateTimeObj);
      if (isNaN(date.getTime())) return '';
      
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('OutlookService: Error formatting time:', error);
      return '';
    }
  }

  static async getUserIdentityToken() {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.getUserIdentityTokenAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
        } else {
          console.warn('OutlookService: Could not get user identity token:', result.error);
          resolve(null); // Don't fail the entire operation
        }
      });
    });
  }

  // Keep the old method for backward compatibility
  static async createEmailArchiveData(parentId, currentUserId) {
    return this.createCompleteEmailArchiveData(parentId, currentUserId);
  }
}

export default OutlookService;