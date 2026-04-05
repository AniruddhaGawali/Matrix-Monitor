using System.ComponentModel;

namespace MatrixMonitor.Core.Model;


public enum AttackCategory
{
    [Description("Altering DNS records resulting in improper redirection.")]
    DnsCompromise = 1,

    [Description("Falsifying domain server cache (cache poisoning).")]
    DnsPoisoning = 2,

    [Description("Fraudulent orders.")]
    FraudOrders = 3,

    [Description("Participating in distributed denial-of-service (usually part of botnet).")]
    DDoSAttack = 4,

    [Description("FTP Brute-Force")]
    FtpBruteForce = 5,

    [Description("Oversized IP packet.")]
    PingOfDeath = 6,

    [Description("Phishing websites and/or email.")]
    Phishing = 7,

    [Description("Fraud VoIP")]
    FraudVoIP = 8,

    [Description("Open proxy, open relay, or Tor exit node.")]
    OpenProxy = 9,

    [Description("Comment/forum spam, HTTP referer spam, or other CMS spam.")]
    WebSpam = 10,

    [Description("Spam email content, infected attachments, and phishing emails.")]
    EmailSpam = 11,

    [Description("CMS blog comment spam.")]
    BlogSpam = 12,

    [Description("Conjunctive category.")]
    VpnIP = 13,

    [Description("Scanning for open ports and vulnerable services.")]
    PortScan = 14,

    [Description("Hacking")]
    Hacking = 15,

    [Description("Attempts at SQL injection.")]
    SqlInjection = 16,

    [Description("Email sender spoofing.")]
    Spoofing = 17,

    [Description("Credential brute-force attacks on webpage logins and services.")]
    BruteForce = 18,

    [Description("Webpage scraping and crawlers that do not honor robots.txt.")]
    BadWebBot = 19,

    [Description("Host is likely infected with malware.")]
    ExploitedHost = 20,

    [Description("Attempts to probe for or exploit installed web applications.")]
    WebAppAttack = 21,

    [Description("Secure Shell (SSH) abuse.")]
    SSH = 22,

    [Description("Abuse was targeted at an Internet of Things type device.")]
    IoTTargeted = 23
}

