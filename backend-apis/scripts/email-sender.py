import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import markdown
import sys

#handle null values in the script if null then put "" in the place of null value
recipient_email, campaign_name, offer_details = sys.argv[1:4] if len(sys.argv) > 3 else ("vishalgupta1504@gmail.com", "Campaign Name", "Offer Details")

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
        print("Email sent successfully!")
        
    except Exception as e:
        print(f"Failed to send email. Error: {str(e)}")
    
    finally:
        server.quit()

email = "offershubbarclays@gmail.com"
password = "pany jzht ucrv lfwv" 
subject = "Campaign Selection Notification"
markdown_body = f"""
# Congratulations!

We are excited to inform you that you have been selected for the following campaign:

### **Campaign Name**
*{campaign_name}*

### **Offer Details**
*{offer_details}*

We look forward to your participation!
Thank you for being a valued member of our community.

### **Best Regards,**
### **Offers Hub Team**
"""

send_email_using_gmail(email, password, recipient_email, subject, markdown_body)
