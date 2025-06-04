import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import markdown

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
recipient_email = "vishalgupta1504@gmail.com"
subject = "Test Email with Markdown"
markdown_body = """
# Hello, This is a test email
This is a sample **markdown** email.

- Item 1
- Item 2
- Item 3

[Click here](https://example.com) to visit a website.
"""

send_email_using_gmail(email, password, recipient_email, subject, markdown_body)
