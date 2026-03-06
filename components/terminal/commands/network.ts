import { col, L, BR } from "../colors"
import type { CommandHandler } from "../types"

// ── Network Commands ───────────────────────────────────────────────────────────

export const networkCommands: Record<string, CommandHandler> = {
  ping: () => [
    L("PING rejectmodders.dev (76.76.21.21): 56 data bytes", col.fg),
    L("64 bytes from 76.76.21.21: icmp_seq=0 ttl=56 time=14.2 ms", col.green),
    L("64 bytes from 76.76.21.21: icmp_seq=1 ttl=56 time=13.8 ms", col.green),
    L("64 bytes from 76.76.21.21: icmp_seq=2 ttl=56 time=14.1 ms", col.green),
    L("64 bytes from 76.76.21.21: icmp_seq=3 ttl=56 time=13.9 ms", col.green),
    BR(),
    L("--- rejectmodders.dev ping statistics ---", col.fg),
    L("4 packets transmitted, 4 received, 0% packet loss", col.green),
    L("round-trip min/avg/max = 13.8/14.0/14.2 ms", col.fg),
    BR(),
  ],

  curl: () => [
    L("HTTP/2 200", col.green),
    L("date: " + new Date().toUTCString(), col.fg),
    L("content-type: text/html; charset=utf-8", col.fg),
    L("cache-control: public, max-age=0, must-revalidate", col.fg),
    L("x-vercel-cache: HIT", col.green),
    L("x-vercel-id: iad1::1337-1234567890", col.fg),
    L("strict-transport-security: max-age=63072000; includeSubDomains", col.fg),
    L("x-frame-options: DENY", col.fg),
    L("x-content-type-options: nosniff", col.fg),
    L("referrer-policy: strict-origin-when-cross-origin", col.fg),
    L("content-security-policy: default-src 'self'; ...", col.fg),
    L("cross-origin-embedder-policy: credentialless", col.fg),
    L("permissions-policy: camera=(), microphone=(), ...", col.fg),
    L('nel: {"report_to":"default","max_age":86400}', col.fg),
    BR(),
  ],

  whois: () => [
    L("% WHOIS rejectmodders.dev", col.muted),
    BR(),
    L("  Domain Name:   REJECTMODDERS.DEV", col.fg),
    L("  Registrar:     is-a.dev (open-source subdomain project)", col.fg),
    L("  Created:       2024", col.fg),
    L("  Status:        ACTIVE", col.green),
    L("  Name Servers:  ns1.vercel-dns.com, ns2.vercel-dns.com", col.fg),
    L("  Owner:         RejectModders", col.primary),
    BR(),
    L("  whois github.com/is-a-dev/register for your own!", col.muted),
    BR(),
  ],

  traceroute: () => [
    L("traceroute to rejectmodders.dev (76.76.21.21)", col.fg),
    BR(),
    L(" 1  your-router (192.168.1.1)          0.4 ms", col.fg),
    L(" 2  isp-gateway (10.0.0.1)             2.1 ms", col.fg),
    L(" 3  backbone-1 (45.12.34.56)           8.3 ms", col.fg),
    L(" 4  cloudflare-edge (104.21.0.1)      12.7 ms", col.fg),
    L(" 5  vercel-edge (76.76.21.1)          14.2 ms", col.fg),
    L(" 6  rejectmodders.dev (76.76.21.21)  14.9 ms", col.green),
    BR(),
    L("6 hops. not bad.", col.muted),
    BR(),
  ],

  nmap: () => [
    L("Starting Nmap scan on rejectmodders.dev...", col.fg),
    BR(),
    L("  PORT    STATE  SERVICE", col.primary),
    L("  80/tcp  open   http     → redirects to HTTPS", col.fg),
    L("  443/tcp open   https    → Next.js 16", col.green),
    L("  22/tcp  closed ssh      → nice try", col.red),
    L("  3306    closed mysql    → really nice try", col.red),
    L("  6969    open   easter   → you're already in it", col.yellow),
    BR(),
    L("Nmap done: 1 IP address scanned.", col.muted),
    BR(),
  ],

  ssh: () => [
    L("ssh rm@rejectmodders.dev", col.muted),
    BR(),
    L("ssh: connect to host rejectmodders.dev port 22: Connection refused", col.red),
    BR(),
    L("Yeah, no SSH here. It's a static site.", col.muted),
    L("Try the terminal easter egg instead (you already did).", col.muted),
    BR(),
  ],

  netstat: () => [
    L("Active Internet connections (servers and established)", col.primary),
    BR(),
    L("Proto  Local Address           Foreign Address         State", col.muted),
    L("tcp    0.0.0.0:443             0.0.0.0:*               LISTEN", col.fg),
    L("tcp    0.0.0.0:80              0.0.0.0:*               LISTEN", col.fg),
    L("tcp    127.0.0.1:3000          127.0.0.1:52341         ESTABLISHED", col.green),
    L("tcp    76.76.21.21:443         your-ip:*               ESTABLISHED", col.green),
    L("tcp    0.0.0.0:6969            0.0.0.0:*               LISTEN", col.yellow),
    BR(),
    L("Port 6969: easter-egg service (you're connected)", col.muted),
    BR(),
  ],

  dig: (args) => {
    const domain = (args ?? "").replace(/^dig\s*/i, "").trim() || "rejectmodders.dev"
    return [
      L(`; <<>> DiG 9.18 <<>> ${domain}`, col.muted),
      L(";; QUESTION SECTION:", col.fg),
      L(`;${domain}.    IN  A`, col.fg),
      BR(),
      L(";; ANSWER SECTION:", col.fg),
      L(`${domain}.    300  IN  A  76.76.21.21`, col.green),
      L(`${domain}.    300  IN  A  76.76.21.22`, col.green),
      BR(),
      L(";; Query time: 4 msec", col.muted),
      L(";; SERVER: 1.1.1.1#53(1.1.1.1)", col.muted),
      BR(),
    ]
  },

  nslookup: (args) => {
    const domain = (args ?? "").replace(/^nslookup\s*/i, "").trim() || "rejectmodders.dev"
    return [
      L(`Server:  1.1.1.1`, col.muted),
      L(`Address: 1.1.1.1#53`, col.muted),
      BR(),
      L(`Non-authoritative answer:`, col.fg),
      L(`Name:    ${domain}`, col.fg),
      L(`Address: 76.76.21.21`, col.green),
      BR(),
    ]
  },

  "ip addr": () => [
    L("1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536", col.fg),
    L("   inet 127.0.0.1/8 scope host lo", col.fg),
    L("   inet6 ::1/128 scope host", col.fg),
    BR(),
    L("2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500", col.fg),
    L("   inet 76.76.21.21/24 brd 76.76.21.255 scope global eth0", col.green),
    L("   inet6 2606:4700::6810:1515/128 scope global dynamic", col.fg),
    BR(),
  ],

  ss: () => [
    L("Netid  State   Recv-Q  Send-Q  Local Address:Port  Peer Address:Port", col.primary),
    L("tcp    LISTEN  0       128     0.0.0.0:443         0.0.0.0:*", col.green),
    L("tcp    LISTEN  0       128     0.0.0.0:80          0.0.0.0:*", col.fg),
    L("tcp    ESTAB   0       0       76.76.21.21:443     *:*", col.fg),
    BR(),
  ],

  iptables: () => [
    L("Chain INPUT (policy ACCEPT)", col.fg),
    L("target     prot  source           destination", col.primary),
    L("ACCEPT     tcp   anywhere         anywhere    tcp dpt:https", col.green),
    L("ACCEPT     tcp   anywhere         anywhere    tcp dpt:http", col.green),
    L("DROP       tcp   evil.com         anywhere", col.red),
    BR(),
    L("Chain FORWARD (policy DROP)", col.fg),
    L("Chain OUTPUT (policy ACCEPT)", col.fg),
    BR(),
  ],

  ufw: () => [
    L("Status: active", col.green),
    BR(),
    L("To                         Action      From", col.primary),
    L("──                         ──────      ────", col.muted),
    L("443/tcp                    ALLOW IN    Anywhere", col.green),
    L("80/tcp                     ALLOW IN    Anywhere", col.green),
    L("22/tcp                     DENY IN     Anywhere", col.red),
    BR(),
  ],

  arp: () => [
    L("Address                  HWtype  HWaddress             Flags Iface", col.primary),
    L("192.168.1.1              ether   00:11:22:33:44:55     C     eth0", col.fg),
    L("76.76.21.21              ether   de:ad:be:ef:00:01     C     eth0", col.fg),
    BR(),
  ],

  myip: () => [
    L("Fetching your IP...", col.muted),
    L("  (this is a static terminal, so here's a fun fact instead)", col.muted),
    L("  Your IP is visible to every server you connect to.", col.fg),
    L("  Consider a VPN if that bothers you.", col.muted),
    L("  Real check: curl ifconfig.me in your actual terminal.", col.cyan),
    BR(),
  ],

  "curl ifconfig.me": () => [
    L("Fetching your public IP...", col.muted),
    L("(this would reveal your IP - so we won't)", col.yellow),
    L("Use 'myip' for a safe version.", col.muted),
    BR(),
  ],
}
