export enum AttackCategory {
  DnsCompromise = 1,
  DnsPoisoning = 2,
  FraudOrders = 3,
  DDoSAttack = 4,
  FtpBruteForce = 5,
  PingOfDeath = 6,
  Phishing = 7,
  FraudVoIP = 8,
  OpenProxy = 9,
  WebSpam = 10,
  EmailSpam = 11,
  BlogSpam = 12,
  VpnIP = 13,
  PortScan = 14,
  Hacking = 15,
  SqlInjection = 16,
  Spoofing = 17,
  BruteForce = 18,
  BadWebBot = 19,
  ExploitedHost = 20,
  WebAppAttack = 21,
  SSH = 22,
  IoTTargeted = 23,
}

export const AttackCategoryDescriptions: Record<AttackCategory, string> = {
  [AttackCategory.DnsCompromise]:
    "Altering DNS records resulting in improper redirection.",
  [AttackCategory.DnsPoisoning]:
    "Falsifying domain server cache (cache poisoning).",
  [AttackCategory.FraudOrders]: "Fraudulent orders.",
  [AttackCategory.DDoSAttack]:
    "Participating in distributed denial-of-service (usually part of botnet).",
  [AttackCategory.FtpBruteForce]: "FTP Brute-Force",
  [AttackCategory.PingOfDeath]: "Oversized IP packet.",
  [AttackCategory.Phishing]: "Phishing websites and/or email.",
  [AttackCategory.FraudVoIP]: "Fraud VoIP",
  [AttackCategory.OpenProxy]: "Open proxy, open relay, or Tor exit node.",
  [AttackCategory.WebSpam]:
    "Comment/forum spam, HTTP referer spam, or other CMS spam.",
  [AttackCategory.EmailSpam]:
    "Spam email content, infected attachments, and phishing emails.",
  [AttackCategory.BlogSpam]: "CMS blog comment spam.",
  [AttackCategory.VpnIP]: "Conjunctive category.",
  [AttackCategory.PortScan]: "Scanning for open ports and vulnerable services.",
  [AttackCategory.Hacking]: "Hacking",
  [AttackCategory.SqlInjection]: "Attempts at SQL injection.",
  [AttackCategory.Spoofing]: "Email sender spoofing.",
  [AttackCategory.BruteForce]:
    "Credential brute-force attacks on webpage logins and services.",
  [AttackCategory.BadWebBot]:
    "Webpage scraping and crawlers that do not honor robots.txt.",
  [AttackCategory.ExploitedHost]: "Host is likely infected with malware.",
  [AttackCategory.WebAppAttack]:
    "Attempts to probe for or exploit installed web applications.",
  [AttackCategory.SSH]: "Secure Shell (SSH) abuse.",
  [AttackCategory.IoTTargeted]:
    "Abuse was targeted at an Internet of Things type device.",
};
