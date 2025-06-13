import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import markdown
import sys
from typing import Optional, Dict, Any

# Handle null values in the script if null then put "" in the place of null value
recipient_email, campaign_name = sys.argv[1:3] if len(sys.argv) > 2 else ("vishalgupta1504@gmail.com", "Campaign Name")

def send_email(recipient_email: str, campaign_name: str, customer_name: Optional[str] = None, 
               offer_details: Optional[Dict[str, Any]] = None):
    """
    Send an email to a customer about a campaign offer
    
    Args:
        recipient_email: Customer's email address
        campaign_name: Name of the campaign
        customer_name: Customer's full name (optional)
        offer_details: Dictionary containing offer details (optional)
    """
    def send_email_using_gmail(email, password, recipient_email, subject, markdown_body):
        html_body = markdown.markdown(markdown_body)
        
        msg = MIMEMultipart()
        msg['From'] = email
        msg['To'] = recipient_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(html_body, 'html'))

        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()  # Start TLS encryption
            server.login(email, password)
            server.sendmail(email, recipient_email, msg.as_string())
            print(f"Email sent successfully to {recipient_email}!")
            
        except Exception as e:
            print(f"Failed to send email to {recipient_email}. Error: {str(e)}")
        
        finally:
            server.quit()

    email = "offershubbarclays@gmail.com"
    password = "pany jzht ucrv lfwv" 
    subject = f"Exclusive Offer: {campaign_name}"
    
    # Extract offer details if provided
    interest_rate = None
    term_months = None
    product_name = None
    
    if offer_details:
        interest_rate = offer_details.get("interest_rate")
        term_months = offer_details.get("term_months")
        product_name = offer_details.get("product_name", campaign_name)
    
    # Personalize greeting if customer name is provided
    greeting = f"Dear {customer_name}," if customer_name else "Dear Valued Customer,"
    
    # Build the email body
    markdown_body = f"""# {greeting}

We are excited to present you with an exclusive offer tailored just for you!

## **{campaign_name}**

"""

    # Add offer details if available
    if product_name:
        markdown_body += f"### Product: **{product_name}**\n\n"
    
    if interest_rate is not None:
        markdown_body += f"### Interest Rate: **{interest_rate}%**\n\n"
        
    if term_months is not None:
        markdown_body += f"### Term: **{term_months} months**\n\n"
    
    # Add call to action and footer
    markdown_body += """
## How to Redeem

1. Log in to your account
2. Navigate to the "Offers" section
3. Select this offer and follow the instructions

This offer is personalized based on your profile and is available for a limited time.

---

### **Best Regards,**  
### **Offers Hub Team**

*This email was sent to you because you opted to receive offers from us. To unsubscribe, please click [here](#).*
"""

    send_email_using_gmail(email, password, recipient_email, subject, markdown_body)