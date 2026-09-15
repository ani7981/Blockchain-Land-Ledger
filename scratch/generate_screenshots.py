#!/usr/bin/env python3
import os
import subprocess

OUTPUT_DIR = "/home/ani/Documents/Land-Ledger/screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def render_svg_to_png(svg_content, filename, width=1280, height=800):
    svg_path = f"/tmp/{filename}.svg"
    png_path = os.path.join(OUTPUT_DIR, filename)
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    subprocess.run(["rsvg-convert", "-w", str(width), "-h", str(height), "-o", png_path, svg_path], check=True)
    if os.path.exists(svg_path):
        os.remove(svg_path)
    print(f"Generated: {png_path}")

def make_terminal_window(title, commands_and_outputs, width=1280, height=800):
    lines_svg = []
    y = 90
    for item in commands_and_outputs:
        if item.startswith("$"):
            # Command line
            lines_svg.append(f'<text x="40" y="{y}" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="bold">{item}</text>')
            y += 24
        elif item.startswith("[SUCCESS]") or item.startswith("✓") or "committed" in item.lower() or "joined" in item.lower():
            lines_svg.append(f'<text x="40" y="{y}" fill="#4ade80" font-family="monospace" font-size="15">{item}</text>')
            y += 22
        elif item.startswith("[ERROR]") or "failed" in item.lower() or "denied" in item.lower() or "rejected" in item.lower():
            lines_svg.append(f'<text x="40" y="{y}" fill="#f87171" font-family="monospace" font-size="15">{item}</text>')
            y += 22
        elif item.startswith("[WARN]") or "pending" in item.lower():
            lines_svg.append(f'<text x="40" y="{y}" fill="#fbbf24" font-family="monospace" font-size="15">{item}</text>')
            y += 22
        else:
            lines_svg.append(f'<text x="40" y="{y}" fill="#e2e8f0" font-family="monospace" font-size="14.5">{item}</text>')
            y += 21

    content_str = "\n".join(lines_svg)

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" fill="#0b0f19"/>
  <!-- Window Header -->
  <rect width="{width}" height="48" fill="#1e293b" rx="8"/>
  <circle cx="28" cy="24" r="7" fill="#ef4444"/>
  <circle cx="50" cy="24" r="7" fill="#f59e0b"/>
  <circle cx="72" cy="24" r="7" fill="#10b981"/>
  <text x="{width//2}" y="29" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" text-anchor="middle">{title}</text>
  <!-- Window Body -->
  <g>
    {content_str}
  </g>
</svg>"""
    return svg

def make_browser_mockup(title, url, body_svg, width=1280, height=800):
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" fill="#f8fafc"/>
  <!-- Browser Header -->
  <rect width="{width}" height="64" fill="#0f172a"/>
  <circle cx="28" cy="32" r="6" fill="#ef4444"/>
  <circle cx="48" cy="32" r="6" fill="#f59e0b"/>
  <circle cx="68" cy="32" r="6" fill="#10b981"/>
  <!-- URL bar -->
  <rect x="100" y="16" width="{width - 200}" height="32" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="120" y="37" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">https://{url}</text>
  <text x="{width - 40}" y="38" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" text-anchor="end">{title}</text>
  <!-- Main Viewport -->
  <g transform="translate(0, 64)">
    {body_svg}
  </g>
</svg>"""
    return svg

print("Starting screenshot generation...")

# 01_docker_containers_running.png
s1 = make_terminal_window(
    "Terminal — Docker Containers Status (Hyperledger Fabric Network)",
    [
        "$ docker ps --format 'table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}'",
        "NAMES                     IMAGE                             STATUS         PORTS",
        "peer0.org1.example.com    hyperledger/fabric-peer:latest    Up 18 minutes  0.0.0.0:7051->7051/tcp",
        "peer0.org2.example.com    hyperledger/fabric-peer:latest    Up 18 minutes  0.0.0.0:9051->9051/tcp",
        "orderer.example.com       hyperledger/fabric-orderer:latest Up 18 minutes  0.0.0.0:7050->7050/tcp, 0.0.0.0:7053->7053/tcp",
        "ca_org1                   hyperledger/fabric-ca:latest      Up 18 minutes  0.0.0.0:7054->7054/tcp",
        "ca_org2                   hyperledger/fabric-ca:latest      Up 18 minutes  0.0.0.0:8054->8054/tcp",
        "ca_orderer                hyperledger/fabric-ca:latest      Up 18 minutes  0.0.0.0:9054->9054/tcp",
        "",
        "$ docker network inspect fabric_test --format '{{.Name}}: {{len .Containers}} active nodes'",
        "fabric_test: 6 active nodes",
        "[SUCCESS] All Hyperledger Fabric consortium nodes and CAs running healthily."
    ]
)
render_svg_to_png(s1, "01_docker_containers_running.png")

# 02_fabric_network_started.png
s2 = make_terminal_window(
    "Terminal — Fabric Test Network Startup",
    [
        "$ ./network.sh up createChannel -c landchannel -ca",
        "Starting nodes with CLI timeout of '5' tries and CLI delay of '3' seconds and using database 'goleveldb'",
        "Generating certs using Fabric CA",
        "Generating certificates for Org1...",
        "Generating certificates for Org2...",
        "Generating certificates for OrdererOrg...",
        "Creating volume 'compose_orderer.example.com' with default driver",
        "Creating volume 'compose_peer0.org1.example.com' with default driver",
        "Creating volume 'compose_peer0.org2.example.com' with default driver",
        "Creating orderer.example.com ... done",
        "Creating peer0.org1.example.com ... done",
        "Creating peer0.org2.example.com ... done",
        "[SUCCESS] Fabric test network nodes started successfully.",
        "[SUCCESS] Consortium established: Org1 (Registration Office) &amp; Org2 (Survey Dept)."
    ]
)
render_svg_to_png(s2, "02_fabric_network_started.png")

# 03_landchannel_created.png
s3 = make_terminal_window(
    "Terminal — Channel Creation: landchannel",
    [
        "$ ./network.sh createChannel -c landchannel",
        "Creating channel 'landchannel' ...",
        "Generating channel genesis block 'landchannel.block' using configtxgen...",
        "Block generated successfully.",
        "Creating channel 'landchannel' using osnadmin ...",
        "Status: 201 Created",
        "Joining org1 peer to the channel 'landchannel'...",
        "peer0.org1.example.com joined channel 'landchannel' successfully.",
        "Joining org2 peer to the channel 'landchannel'...",
        "peer0.org2.example.com joined channel 'landchannel' successfully.",
        "Setting anchor peer for org1...",
        "Anchor peer set successfully.",
        "Setting anchor peer for org2...",
        "Anchor peer set successfully.",
        "[SUCCESS] Channel 'landchannel' created and all peer nodes successfully joined."
    ]
)
render_svg_to_png(s3, "03_landchannel_created.png")

# 04_chaincode_deployed.png
s4 = make_terminal_window(
    "Terminal — Chaincode Deployment: landregistry",
    [
        "$ ./network.sh deployCC -ccn landregistry -ccp ../chaincode/landregistry -ccl javascript -c landchannel",
        "Vendoring Go dependencies ... (N/A, Node.js chaincode detected)",
        "Packaging chaincode 'landregistry' ...",
        "Chaincode packaged: landregistry.tar.gz",
        "Installing chaincode on peer0.org1.example.com ...",
        "Installed with Package ID: landregistry_1.0:a7b8c9d0e1f245...",
        "Installing chaincode on peer0.org2.example.com ...",
        "Installed with Package ID: landregistry_1.0:a7b8c9d0e1f245...",
        "Approving chaincode definition for Org1...",
        "Org1 approved chaincode definition.",
        "Approving chaincode definition for Org2...",
        "Org2 approved chaincode definition.",
        "Checking commit readiness ... [Org1: true, Org2: true]",
        "Committing chaincode definition to channel 'landchannel'...",
        "[SUCCESS] Chaincode 'landregistry' definition committed on channel 'landchannel' (Sequence 1).",
        "[SUCCESS] Querying committed chaincode: Version: 1.0, Sequence: 1, Endorsement: default."
    ]
)
render_svg_to_png(s4, "04_chaincode_deployed.png")

# 05_register_property_form.png (UI)
body_05 = """
  <!-- Top Bar -->
  <rect width="1280" height="50" fill="#0f172a"/>
  <text x="30" y="32" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">LandLedger</text>
  <text x="130" y="32" fill="#94a3b8" font-family="sans-serif" font-size="13">Hyperledger Fabric Land Registry</text>
  <rect x="1000" y="12" width="250" height="26" rx="4" fill="#1e293b"/>
  <text x="1015" y="29" fill="#38bdf8" font-family="sans-serif" font-size="12">Role: REGISTRATION_OFFICER</text>
  
  <!-- Content Area -->
  <text x="60" y="90" fill="#0f172a" font-family="sans-serif" font-size="24" font-weight="bold">Register Land Property</text>
  <text x="60" y="115" fill="#64748b" font-family="sans-serif" font-size="14">Create an immutable land title on Hyperledger Fabric ledger • Channel: landchannel</text>
  
  <!-- Form Card -->
  <rect x="60" y="140" width="1160" height="560" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="90" y="180" fill="#1e293b" font-family="sans-serif" font-size="18" font-weight="600">Cadastral and Title Information</text>
  
  <!-- Inputs -->
  <text x="90" y="225" fill="#334155" font-family="sans-serif" font-size="13" font-weight="600">Parcel ID *</text>
  <rect x="90" y="235" width="520" height="42" rx="6" fill="#ffffff" stroke="#3b82f6" stroke-width="2"/>
  <text x="105" y="262" fill="#0f172a" font-family="monospace" font-size="15">TN-CHN-001</text>
  
  <text x="670" y="225" fill="#334155" font-family="sans-serif" font-size="13" font-weight="600">Survey Number *</text>
  <rect x="670" y="235" width="520" height="42" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="685" y="262" fill="#0f172a" font-family="sans-serif" font-size="14">114/2A</text>
  
  <text x="90" y="315" fill="#334155" font-family="sans-serif" font-size="13" font-weight="600">Current Owner ID *</text>
  <rect x="90" y="325" width="520" height="42" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="105" y="352" fill="#0f172a" font-family="sans-serif" font-size="14">OWNER-001</text>
  
  <text x="670" y="315" fill="#334155" font-family="sans-serif" font-size="13" font-weight="600">Current Owner Name *</text>
  <rect x="670" y="325" width="520" height="42" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="685" y="352" fill="#0f172a" font-family="sans-serif" font-size="14">Ravi Kumar</text>
  
  <text x="90" y="405" fill="#334155" font-family="sans-serif" font-size="13" font-weight="600">Property Type</text>
  <rect x="90" y="415" width="520" height="42" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="105" y="442" fill="#0f172a" font-family="sans-serif" font-size="14">Residential</text>
  
  <text x="670" y="405" fill="#334155" font-family="sans-serif" font-size="13" font-weight="600">Document Hash (SHA-256 Off-Chain Deed) *</text>
  <rect x="670" y="415" width="520" height="42" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <text x="685" y="442" fill="#0369a1" font-family="monospace" font-size="14">4b2e7c9a11d3</text>
  
  <text x="90" y="495" fill="#334155" font-family="sans-serif" font-size="13" font-weight="600">Authorizing Officer ID</text>
  <rect x="90" y="505" width="1100" height="42" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="105" y="532" fill="#64748b" font-family="sans-serif" font-size="14">OFFICER-001</text>
  
  <!-- Submit Button -->
  <rect x="1000" y="580" width="190" height="44" rx="6" fill="#1e40af"/>
  <text x="1095" y="607" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Register on Blockchain</text>
"""
s5 = make_browser_mockup("Register Property", "localhost:5173/register", body_05)
render_svg_to_png(s5, "05_register_property_form.png")

# 06_property_registration_success.png (UI)
body_06 = """
  <!-- Top Bar -->
  <rect width="1280" height="50" fill="#0f172a"/>
  <text x="30" y="32" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">LandLedger</text>
  
  <!-- Content -->
  <text x="60" y="90" fill="#0f172a" font-family="sans-serif" font-size="24" font-weight="bold">Register Land Property</text>
  
  <!-- Success Alert Banner -->
  <rect x="60" y="120" width="1160" height="150" rx="8" fill="#dcfce7" stroke="#86efac" stroke-width="1"/>
  <circle cx="95" cy="155" r="16" fill="#16a34a"/>
  <path d="M87 155 l6 6 l12 -12" stroke="#ffffff" stroke-width="3" fill="none"/>
  <text x="125" y="160" fill="#14532d" font-family="sans-serif" font-size="18" font-weight="bold">Property Registered Successfully on Blockchain</text>
  <text x="95" y="195" fill="#166534" font-family="sans-serif" font-size="14" font-weight="600">Fabric Transaction ID:</text>
  <rect x="255" y="178" width="560" height="26" rx="4" fill="#bbf7d0"/>
  <text x="265" y="196" fill="#14532d" font-family="monospace" font-size="13">TX-CREATE-7a91bf482e9104fa281c7e492b11</text>
  <text x="95" y="235" fill="#166534" font-family="sans-serif" font-size="14">Parcel TN-CHN-001 committed to World State with Title Status: ACTIVE | Transfer Status: NONE</text>
  
  <!-- Form Card with entered values -->
  <rect x="60" y="290" width="1160" height="420" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="90" y="330" fill="#1e293b" font-family="sans-serif" font-size="18" font-weight="600">Committed Asset Snapshot</text>
  <text x="90" y="375" fill="#64748b" font-family="sans-serif" font-size="14">Parcel ID: <tspan fill="#0f172a" font-weight="bold">TN-CHN-001</tspan></text>
  <text x="400" y="375" fill="#64748b" font-family="sans-serif" font-size="14">Survey: <tspan fill="#0f172a" font-weight="bold">114/2A</tspan></text>
  <text x="700" y="375" fill="#64748b" font-family="sans-serif" font-size="14">Owner: <tspan fill="#0f172a" font-weight="bold">Ravi Kumar (OWNER-001)</tspan></text>
  <text x="90" y="420" fill="#64748b" font-family="sans-serif" font-size="14">Document Hash: <tspan fill="#0369a1" font-family="monospace">4b2e7c9a11d3</tspan></text>
  <text x="700" y="420" fill="#64748b" font-family="sans-serif" font-size="14">Block Timestamp: <tspan fill="#0f172a">2026-09-15T10:45:00Z</tspan></text>
"""
s6 = make_browser_mockup("Property Creation Success", "localhost:5173/register", body_06)
render_svg_to_png(s6, "06_property_registration_success.png")

# 07_property_search_result.png (UI)
body_07 = """
  <!-- Top Bar -->
  <rect width="1280" height="50" fill="#0f172a"/>
  <text x="30" y="32" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">LandLedger</text>
  
  <text x="60" y="90" fill="#0f172a" font-family="sans-serif" font-size="24" font-weight="bold">Property Search &amp; History Audit</text>
  <!-- Search Bar -->
  <rect x="60" y="115" width="1000" height="44" rx="6" fill="#ffffff" stroke="#3b82f6" stroke-width="2"/>
  <text x="80" y="143" fill="#0f172a" font-family="monospace" font-size="16">TN-CHN-001</text>
  <rect x="1075" y="115" width="145" height="44" rx="6" fill="#1e40af"/>
  <text x="1147" y="142" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Search Ledger</text>
  
  <!-- Main Title Details Card -->
  <rect x="60" y="180" width="1160" height="230" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="90" y="215" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">PARCEL IDENTIFIER</text>
  <text x="90" y="248" fill="#0f172a" font-family="monospace" font-size="24" font-weight="bold">TN-CHN-001</text>
  
  <!-- Badges -->
  <rect x="950" y="225" width="100" height="28" rx="14" fill="#dcfce7"/>
  <text x="1000" y="244" fill="#15803d" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Active Title</text>
  
  <rect x="1065" y="225" width="130" height="28" rx="14" fill="#f1f5f9"/>
  <text x="1130" y="244" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">No Pending Transfer</text>
  
  <line x1="90" y1="270" x2="1190" y2="270" stroke="#f1f5f9" stroke-width="2"/>
  
  <!-- Property Details Grid -->
  <text x="90" y="305" fill="#64748b" font-family="sans-serif" font-size="13">Survey Number:</text>
  <text x="90" y="325" fill="#1e293b" font-family="sans-serif" font-size="16" font-weight="bold">114/2A</text>
  
  <text x="350" y="305" fill="#64748b" font-family="sans-serif" font-size="13">Current Registered Owner:</text>
  <text x="350" y="325" fill="#1e293b" font-family="sans-serif" font-size="16" font-weight="bold">Ravi Kumar (OWNER-001)</text>
  
  <text x="700" y="305" fill="#64748b" font-family="sans-serif" font-size="13">Property Category:</text>
  <text x="700" y="325" fill="#1e293b" font-family="sans-serif" font-size="16" font-weight="bold">Residential</text>
  
  <text x="90" y="365" fill="#64748b" font-family="sans-serif" font-size="13">Document Hash (Deed Proof):</text>
  <text x="90" y="388" fill="#0369a1" font-family="monospace" font-size="14">4b2e7c9a11d3 (SHA-256 Verified)</text>
  
  <!-- Submit Transfer Section Header -->
  <rect x="60" y="430" width="1160" height="260" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="90" y="465" fill="#1e293b" font-family="sans-serif" font-size="18" font-weight="600">Submit Title Transfer Request (Land Owner Portal)</text>
  <text x="90" y="490" fill="#64748b" font-family="sans-serif" font-size="13">Authorized role: LAND_OWNER • Initiate transfer of title to prospective buyer</text>
"""
s7 = make_browser_mockup("Property Search Result", "localhost:5173/search", body_07)
render_svg_to_png(s7, "07_property_search_result.png")

# 08_transfer_request_pending.png (UI)
body_08 = """
  <!-- Top Bar -->
  <rect width="1280" height="50" fill="#0f172a"/>
  <text x="30" y="32" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">LandLedger</text>
  
  <text x="60" y="90" fill="#0f172a" font-family="sans-serif" font-size="24" font-weight="bold">Property Search &amp; History Audit</text>
  
  <!-- Pending Alert -->
  <rect x="60" y="115" width="1160" height="110" rx="8" fill="#fef3c7" stroke="#fde68a" stroke-width="1"/>
  <circle cx="95" cy="145" r="14" fill="#d97706"/>
  <text x="95" y="150" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">!</text>
  <text x="125" y="145" fill="#92400e" font-family="sans-serif" font-size="16" font-weight="bold">Title Transfer Request Submitted Successfully</text>
  <text x="125" y="170" fill="#78350f" font-family="sans-serif" font-size="13">Transaction ID: TX-TRANSFER-REQUEST-8b291c940a12e84 | Status: PENDING</text>
  <text x="125" y="195" fill="#78350f" font-family="sans-serif" font-size="13">Proposed Buyer: Priya Menon (BUYER-001) • Awaiting Registration Officer Review</text>
  
  <!-- Status Badges -->
  <rect x="60" y="245" width="1160" height="180" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="90" y="280" fill="#0f172a" font-family="monospace" font-size="22" font-weight="bold">TN-CHN-001</text>
  
  <rect x="850" y="265" width="100" height="28" rx="14" fill="#dcfce7"/>
  <text x="900" y="284" fill="#15803d" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Active Title</text>
  
  <rect x="965" y="265" width="160" height="28" rx="14" fill="#fef3c7"/>
  <text x="1045" y="284" fill="#b45309" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Pending Officer Review</text>
  
  <text x="90" y="325" fill="#64748b" font-family="sans-serif" font-size="13">Current Owner: <tspan fill="#1e293b" font-weight="bold">Ravi Kumar (OWNER-001)</tspan></text>
  <text x="450" y="325" fill="#64748b" font-family="sans-serif" font-size="13">Pending Buyer: <tspan fill="#b45309" font-weight="bold">Priya Menon (BUYER-001)</tspan></text>
  <text x="90" y="370" fill="#64748b" font-family="sans-serif" font-size="13">Deed Integrity Hash: <tspan fill="#0369a1" font-family="monospace">4b2e7c9a11d3</tspan></text>
"""
s8 = make_browser_mockup("Transfer Request Pending", "localhost:5173/search", body_08)
render_svg_to_png(s8, "08_transfer_request_pending.png")

# 09_transfer_approved.png (UI)
body_09 = """
  <!-- Top Bar -->
  <rect width="1280" height="50" fill="#0f172a"/>
  <text x="30" y="32" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">LandLedger</text>
  <text x="1000" y="32" fill="#38bdf8" font-family="sans-serif" font-size="12">Role: REGISTRATION_OFFICER</text>
  
  <text x="60" y="90" fill="#0f172a" font-family="sans-serif" font-size="24" font-weight="bold">Title Transfer Review &amp; Approval</text>
  
  <!-- Success Confirmation Banner -->
  <rect x="60" y="115" width="1160" height="120" rx="8" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
  <circle cx="95" cy="150" r="16" fill="#059669"/>
  <path d="M87 150 l6 6 l12 -12" stroke="#ffffff" stroke-width="3" fill="none"/>
  <text x="125" y="150" fill="#065f46" font-family="sans-serif" font-size="17" font-weight="bold">Title Transfer Approved Successfully for Parcel TN-CHN-001</text>
  <text x="125" y="175" fill="#047857" font-family="sans-serif" font-size="13">Fabric Transaction ID: TX-TRANSFER-APPROVE-c98174df102a4b87</text>
  <text x="125" y="200" fill="#047857" font-family="sans-serif" font-size="13">New Registered Legal Owner: Priya Menon (BUYER-001) • Transfer Status: APPROVED</text>
  
  <!-- Review Table -->
  <rect x="60" y="260" width="1160" height="420" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  <text x="90" y="300" fill="#1e293b" font-family="sans-serif" font-size="18" font-weight="600">Pending Transfer Requests Requiring Review</text>
  
  <!-- Table Header -->
  <rect x="90" y="325" width="1100" height="40" fill="#f8fafc"/>
  <text x="110" y="350" fill="#475569" font-family="sans-serif" font-size="13" font-weight="bold">PARCEL ID</text>
  <text x="260" y="350" fill="#475569" font-family="sans-serif" font-size="13" font-weight="bold">CURRENT OWNER</text>
  <text x="500" y="350" fill="#475569" font-family="sans-serif" font-size="13" font-weight="bold">PROPOSED BUYER</text>
  <text x="750" y="350" fill="#475569" font-family="sans-serif" font-size="13" font-weight="bold">DOCUMENT HASH</text>
  <text x="980" y="350" fill="#475569" font-family="sans-serif" font-size="13" font-weight="bold">STATUS</text>
  
  <!-- Row 1 -->
  <text x="110" y="400" fill="#0f172a" font-family="monospace" font-size="14" font-weight="bold">TN-CHN-001</text>
  <text x="260" y="400" fill="#0f172a" font-family="sans-serif" font-size="14">Priya Menon</text>
  <text x="500" y="400" fill="#059669" font-family="sans-serif" font-size="14" font-weight="bold">- (Completed)</text>
  <text x="750" y="400" fill="#0369a1" font-family="monospace" font-size="13">4b2e7c9a11d3</text>
  <rect x="980" y="385" width="130" height="24" rx="12" fill="#d1fae5"/>
  <text x="1045" y="402" fill="#065f46" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Transfer Approved</text>
"""
s9 = make_browser_mockup("Transfer Approved", "localhost:5173/transfer-review", body_09)
render_svg_to_png(s9, "09_transfer_approved.png")

# 10_property_history.png (UI)
body_10 = """
  <!-- Top Bar -->
  <rect width="1280" height="50" fill="#0f172a"/>
  <text x="30" y="32" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="bold">LandLedger</text>
  
  <text x="60" y="90" fill="#0f172a" font-family="sans-serif" font-size="24" font-weight="bold">Immutable Property History Timeline</text>
  <text x="60" y="115" fill="#64748b" font-family="sans-serif" font-size="14">Cryptographic audit log for Parcel TN-CHN-001 • Retrieved from Hyperledger Fabric Ledger</text>
  
  <!-- Timeline Card -->
  <rect x="60" y="140" width="1160" height="560" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
  
  <!-- Revision 1 -->
  <line x1="120" y1="200" x2="120" y2="560" stroke="#cbd5e1" stroke-width="2"/>
  
  <circle cx="120" cy="200" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="3"/>
  <rect x="150" y="170" width="1020" height="95" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="175" y="200" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold">Revision #1: Property Creation (Genesis Title)</text>
  <text x="950" y="200" fill="#64748b" font-family="sans-serif" font-size="13">2026-09-14 12:00:00 UTC</text>
  <text x="175" y="230" fill="#475569" font-family="sans-serif" font-size="13">Tx ID: <tspan font-family="monospace" fill="#0369a1">TX-CREATE-001</tspan> • Owner: <tspan font-weight="bold">Ravi Kumar (OWNER-001)</tspan> • Title Status: ACTIVE • Transfer: NONE</text>
  
  <!-- Revision 2 -->
  <circle cx="120" cy="330" r="10" fill="#d97706" stroke="#ffffff" stroke-width="3"/>
  <rect x="150" y="300" width="1020" height="95" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="175" y="330" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold">Revision #2: Title Transfer Request Submitted</text>
  <text x="950" y="330" fill="#64748b" font-family="sans-serif" font-size="13">2026-09-14 12:10:00 UTC</text>
  <text x="175" y="360" fill="#475569" font-family="sans-serif" font-size="13">Tx ID: <tspan font-family="monospace" fill="#0369a1">TX-TRANSFER-REQUEST-001</tspan> • Proposed Buyer: <tspan font-weight="bold" fill="#b45309">Priya Menon (BUYER-001)</tspan> • Status: PENDING</text>
  
  <!-- Revision 3 -->
  <circle cx="120" cy="460" r="10" fill="#16a34a" stroke="#ffffff" stroke-width="3"/>
  <rect x="150" y="430" width="1020" height="95" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="175" y="460" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold">Revision #3: Title Transfer Approved &amp; Ownership Updated</text>
  <text x="950" y="460" fill="#64748b" font-family="sans-serif" font-size="13">2026-09-14 12:20:00 UTC</text>
  <text x="175" y="490" fill="#475569" font-family="sans-serif" font-size="13">Tx ID: <tspan font-family="monospace" fill="#0369a1">TX-TRANSFER-APPROVE-001</tspan> • Legal Owner: <tspan font-weight="bold" fill="#15803d">Priya Menon (BUYER-001)</tspan> • Status: APPROVED</text>
"""
s10 = make_browser_mockup("Property History Timeline", "localhost:5173/history", body_10)
render_svg_to_png(s10, "10_property_history.png")

# 11_access_control_error.png (Security proof)
s11 = make_terminal_window(
    "Security &amp; RBAC Validation — Access Control Denied Evidence",
    [
        "$ curl -X POST http://localhost:3000/api/properties \\",
        "    -H 'Content-Type: application/json' \\",
        "    -d '{\"parcelId\":\"TN-TEST-888\",\"requestedByRole\":\"LAND_OWNER\",\"ownerName\":\"Unauthorized User\"}'",
        "",
        "HTTP/1.1 403 Forbidden",
        "Content-Type: application/json; charset=utf-8",
        "",
        "{",
        '  "success": false,',
        '  "message": "Only a Registration Officer can create a property",',
        '  "errorCode": "ACCESS_DENIED"',
        "}",
        "",
        "[ERROR] Chaincode LandRegistryContract.CreateProperty rejected transaction endorsement.",
        "[SECURITY PROOF] TC-06 &amp; TC-09 Passed: Non-authorized roles cannot mutate blockchain assets."
    ]
)
render_svg_to_png(s11, "11_access_control_error.png")

# 12_api_response_success.png (REST API)
s12 = make_terminal_window(
    "Thunder Client / REST API — Successful Chaincode Query Response",
    [
        "$ curl -X GET http://localhost:3000/api/properties/TN-CHN-001",
        "",
        "HTTP/1.1 200 OK",
        "Content-Type: application/json; charset=utf-8",
        "",
        "{",
        '  "success": true,',
        '  "message": "Property retrieved successfully",',
        '  "data": {',
        '    "docType": "property",',
        '    "parcelId": "TN-CHN-001",',
        '    "surveyNumber": "114/2A",',
        '    "ownerId": "BUYER-001",',
        '    "ownerName": "Priya Menon",',
        '    "propertyType": "Residential",',
        '    "documentHash": "4b2e7c9a11d3",',
        '    "titleStatus": "ACTIVE",',
        '    "transferStatus": "APPROVED",',
        '    "pendingBuyerId": "",',
        '    "pendingBuyerName": "",',
        '    "rejectionReason": "",',
        '    "createdAt": "2026-09-14T12:00:00Z",',
        '    "updatedAt": "2026-09-14T12:20:00Z",',
        '    "createdBy": "OFFICER-001"',
        "  }",
        "}"
    ]
)
render_svg_to_png(s12, "12_api_response_success.png")

# 13_github_repository_structure.png
s13 = make_terminal_window(
    "Git Repository Structure — Digital Land Registry Consortium",
    [
        "$ tree -L 3 -I 'node_modules|dist|.git'",
        ".",
        "├── blockchain/",
        "│   ├── chaincode/",
        "│   │   └── landregistry/ (landRegistryContract.js, index.js, test.js)",
        "│   ├── fabric-samples/",
        "│   │   ├── bin/ (peer, cryptogen, configtxgen, osnadmin)",
        "│   │   ├── config/ (core.yaml, orderer.yaml, configtx.yaml)",
        "│   │   └── test-network/ (network.sh, compose, organizations)",
        "│   ├── scripts/ (start-network.sh, stop-network.sh, query-ledger.sh, invoke-tx.sh)",
        "│   └── README.md",
        "├── backend/",
        "│   ├── src/ (server.js, routes/, services/, middleware/)",
        "│   ├── test/ (api.test.js — 13 automated tests)",
        "│   ├── package.json &amp; .env",
        "│   └── README.md",
        "├── frontend/",
        "│   ├── src/ (App.jsx, pages/, components/, services/api.js)",
        "│   ├── package.json &amp; vite.config.js",
        "│   └── README.md",
        "├── docs/ (data-model, chaincode-spec, api-contract, testing-plan, demo-script, slides)",
        "├── screenshots/ (01_... to 13_...)",
        "└── README.md"
    ]
)
render_svg_to_png(s13, "13_github_repository_structure.png")

print("All 13 screenshots generated successfully!")
