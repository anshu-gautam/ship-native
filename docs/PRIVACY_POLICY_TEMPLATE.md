# Privacy Policy Template

**Last Updated: [DATE]**

This Privacy Policy template is designed for mobile applications built with this boilerplate. Customize the sections marked with `[BRACKETS]` for your specific app.

---

## Privacy Policy for [YOUR APP NAME]

**Effective Date:** [DATE]

[YOUR COMPANY NAME] ("we," "our," or "us") operates the [YOUR APP NAME] mobile application (the "App"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our App.

### 1. Information Collection and Use

We collect several types of information for various purposes to provide and improve our App for you.

#### 1.1 Personal Data

While using our App, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:

- **Email address**
- **First name and last name**
- **Phone number**
- **Address, State, Province, ZIP/Postal code, City**
- **Cookies and Usage Data**

#### 1.2 Usage Data

We may collect information on how the App is accessed and used ("Usage Data"). This Usage Data may include:

- Device information (model, operating system, unique device identifiers)
- IP address
- Browser type and version
- Pages visited and time spent
- Time and date of visits
- Diagnostic data
- App crashes and performance data

#### 1.3 Tracking & Cookies Data

We use cookies and similar tracking technologies to track activity on our App:

- **Session Cookies:** Used to operate our App
- **Preference Cookies:** Used to remember your preferences and settings
- **Security Cookies:** Used for security purposes
- **Analytics Cookies:** Used to track usage and performance

### 2. Third-Party Services

Our App uses third-party services that may collect information:

#### 2.1 Analytics Services

${this.app.config.sentry ? `
**Sentry** - Error and performance monitoring
- Data collected: Error logs, performance metrics, user context
- Privacy Policy: https://sentry.io/privacy/
` : ''}

${this.app.config.analytics ? `
**[YOUR ANALYTICS SERVICE]**
- Data collected: User interactions, screen views, events
- Privacy Policy: [LINK]
` : ''}

#### 2.2 Authentication Services

${this.app.config.clerk ? `
**Clerk** - User authentication and management
- Data collected: Email, name, authentication tokens
- Privacy Policy: https://clerk.com/privacy
` : ''}

#### 2.3 Payment Processing

${this.app.config.payments ? `
**Stripe** - Payment processing
- Data collected: Payment information, transaction data
- Privacy Policy: https://stripe.com/privacy
- PCI DSS Compliance: All payment data is processed securely

**RevenueCat** - Subscription management
- Data collected: Subscription status, purchase receipts
- Privacy Policy: https://www.revenuecat.com/privacy
` : ''}

#### 2.4 Cloud Services

${this.app.config.supabase ? `
**Supabase** - Backend and database
- Data collected: User data, application data
- Privacy Policy: https://supabase.com/privacy
` : ''}

#### 2.5 Push Notifications

${this.app.config.expo ? `
**Expo Push Notifications**
- Data collected: Device tokens, notification preferences
- Privacy Policy: https://expo.dev/privacy
` : ''}

### 3. Use of Data

[YOUR APP NAME] uses the collected data for various purposes:

- To provide and maintain our App
- To notify you about changes to our App
- To allow you to participate in interactive features
- To provide customer support
- To gather analysis or valuable information to improve our App
- To monitor the usage of our App
- To detect, prevent and address technical issues
- To provide you with news, special offers and general information (if opted-in)
- To comply with legal obligations

### 4. Data Storage and Security

#### 4.1 Data Storage Locations

Your data is stored in:
- **Cloud Servers:** [SPECIFY REGIONS - e.g., US, EU]
- **Local Device:** Some data is cached locally for offline functionality

#### 4.2 Data Retention

We retain your Personal Data only for as long as necessary:
- **Account Data:** Until account deletion + 30 days
- **Usage Data:** 90 days
- **Crash Logs:** 90 days
- **Analytics Data:** 12 months

#### 4.3 Security Measures

We implement industry-standard security measures:
- **Encryption in Transit:** All data transmitted using TLS/SSL
- **Encryption at Rest:** Sensitive data encrypted in storage
- **Access Controls:** Role-based access to user data
- **Regular Security Audits:** Periodic security assessments
- **Secure Authentication:** OAuth 2.0 / OpenID Connect

### 5. Your Data Protection Rights (GDPR)

If you are a resident of the European Economic Area (EEA), you have certain data protection rights:

- **Right to Access:** Request copies of your personal data
- **Right to Rectification:** Request correction of inaccurate data
- **Right to Erasure:** Request deletion of your data
- **Right to Restrict Processing:** Request limitation of data processing
- **Right to Data Portability:** Receive your data in a structured format
- **Right to Object:** Object to processing of your data
- **Right to Withdraw Consent:** Withdraw consent at any time

To exercise these rights, contact us at: [YOUR EMAIL]

### 6. California Privacy Rights (CCPA)

If you are a California resident, you have the right to:

- Know what personal information is collected
- Know if personal information is sold or disclosed
- Say no to the sale of personal information
- Access your personal information
- Request deletion of personal information
- Not be discriminated against for exercising your rights

**We do NOT sell your personal information.**

### 7. Children's Privacy

Our App does not address anyone under the age of ${this.app.config.minAge || 13}.

We do not knowingly collect personally identifiable information from children under ${this.app.config.minAge || 13}. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us.

### 8. Data Deletion

You can delete your account and associated data at any time:

#### Via App:
1. Go to Settings > Account
2. Tap "Delete Account"
3. Confirm deletion

#### Via Email:
Send a request to [YOUR EMAIL] with subject "Account Deletion Request"

**Note:** Account deletion is permanent and cannot be undone. All your data will be deleted within 30 days.

### 9. International Data Transfers

Your information may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ.

We ensure appropriate safeguards are in place:
- **EU-US Data Privacy Framework** (if applicable)
- **Standard Contractual Clauses**
- **Adequacy decisions**

### 10. Changes to This Privacy Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by:

- Posting the new Privacy Policy on this page
- Updating the "Last Updated" date
- Sending you an email notification (for material changes)
- In-app notification

### 11. Contact Us

If you have any questions about this Privacy Policy, please contact us:

- **Email:** [YOUR EMAIL]
- **Address:** [YOUR ADDRESS]
- **Phone:** [YOUR PHONE]

For GDPR-related inquiries:
- **Data Protection Officer:** [DPO EMAIL]

For CCPA-related inquiries:
- **Privacy Contact:** [PRIVACY EMAIL]

---

## Appendix: Data Collection Summary

### Data We Collect

| Data Type | Purpose | Legal Basis (GDPR) | Retention |
|-----------|---------|-------------------|-----------|
| Email | Account creation, communication | Consent, Contract | Until deletion + 30d |
| Name | Personalization | Consent, Contract | Until deletion + 30d |
| Device ID | Analytics, crash reporting | Legitimate Interest | 90 days |
| IP Address | Security, analytics | Legitimate Interest | 90 days |
| Usage Data | App improvement | Legitimate Interest | 12 months |
| Payment Info | Transaction processing | Contract | As required by law |
| Location (if enabled) | [YOUR FEATURE] | Consent | Until disabled |

### Third-Party Data Sharing

We share data with third parties only as necessary:

| Service | Data Shared | Purpose |
|---------|-------------|---------|
| Sentry | Error logs, device info | Crash reporting |
| Analytics | Usage data, events | App improvement |
| Clerk | Email, name | Authentication |
| Stripe | Payment info | Payment processing |
| RevenueCat | Subscription data | Subscription management |

### User Rights Exercise

To exercise your data protection rights:

1. **In-App:** Settings > Privacy > Data Rights
2. **Email:** [YOUR EMAIL]
3. **Response Time:** Within 30 days

---

## Customization Checklist

Before publishing, customize these sections:

- [ ] Replace all `[BRACKETS]` with your actual information
- [ ] Update third-party services list
- [ ] Specify data storage regions
- [ ] Add your contact information
- [ ] Set minimum age requirement
- [ ] Update data retention periods
- [ ] Review and customize GDPR/CCPA sections
- [ ] Have legal counsel review
- [ ] Add specific features' data collection (location, camera, etc.)
- [ ] Update last modified date
- [ ] Translate to required languages (EU requires local language)

---

## Additional Privacy Resources

### Privacy Policy Generators
- [Termly](https://termly.io/products/privacy-policy-generator/)
- [FreePrivacyPolicy](https://www.freeprivacypolicy.com/)
- [TermsFeed](https://www.termsfeed.com/privacy-policy-generator/)

### GDPR Compliance
- [GDPR Official Text](https://gdpr-info.eu/)
- [EU Data Protection](https://ec.europa.eu/info/law/law-topic/data-protection_en)

### CCPA Compliance
- [California AG CCPA](https://oag.ca.gov/privacy/ccpa)

### App Store Requirements
- [Apple Privacy Requirements](https://developer.apple.com/app-store/app-privacy-details/)
- [Google Play Privacy](https://support.google.com/googleplay/android-developer/answer/9859455)
