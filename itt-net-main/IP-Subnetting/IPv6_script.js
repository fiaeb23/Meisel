function toHex(val, bits) {
    // No changes, looks fine.
    return (val >>> 0).toString(16).padStart(Math.ceil(bits / 4), '0');
}

let darkMode = false;
function toggleDarkMode() {
    darkMode = !darkMode;
    if (darkMode) {
	document.body.classList.add('dark-mode');
	localStorage.setItem('darkMode', 'enabled');
    } else {
	document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
    updateDisplay();
}

document.addEventListener("DOMContentLoaded", () => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        darkMode = true;
        document.body.classList.add('dark-mode');
    } else if (savedDarkMode === 'disabled') {
        darkMode = false;
        document.body.classList.remove('dark-mode');
    }
});

const ipv6Prefix = "2a3b4c5d6e7f8901"; // Your predetermined 64-bit IPv6 prefix.

function getNextHexDigit(index) {
    if (index < ipv6Prefix.length) {
	// Get the next digit from the predetermined prefix.
	return ipv6Prefix.charAt(index);
    } else {
	return null; // Return null when we have reached the end of the prefix.
    }
}

function updateExample(networkBits, totalBits, maxSubnets) {
    let ipv6ExamplePrefix = "2";
    let ipv6SubPrefix1 = "";
    let ipv6SubPrefix2 = "";
    let ipv6SubPrefixN = "";
    let nibbleBits = 0; // subnet bits in the current nibble
    let i = 0;

    for (let nibble = 0; nibble < 16; nibble++) {
        nibbleBits = totalBits - i;

	if (i < networkBits ) {                                    // network prefix
	    ipv6ExamplePrefix += getNextHexDigit(i / 4);
	} else if (i === totalBits - 4){                          // all bit in nibble set
	    ipv6SubPrefix1 += "0";
	    ipv6SubPrefix2 += "1";
	    ipv6SubPrefixN += "f";
	} else if (i < totalBits && i < Math.floor(totalBits / 4) * 4) { // subnetprefix
            let ipv6BlockSize = 16 / Math.pow(2, nibbleBits);
	    ipv6SubPrefix1 += "0";
	    ipv6SubPrefix2 += "0";
	    ipv6SubPrefixN += "f";
	} else if (i < totalBits && i >= Math.floor(totalBits / 4) * 4) { // last nibble of subnetprefix
            let ipv6BlockSize = 16 / Math.pow(2, nibbleBits);
	    ipv6SubPrefix1 += "0";
	    ipv6SubPrefix2 += ipv6BlockSize.toString(16);
	    ipv6SubPrefixN += (16 - ipv6BlockSize).toString(16);
	} 
	else {                                                    // unused bits
	    ipv6SubPrefix1 += "0";
	    ipv6SubPrefix2 += "0";
	    ipv6SubPrefixN += "0";
	}
	if  (nibble % 4 === 3 ) {	                          // add colons
	    if (i < networkBits) { ipv6ExamplePrefix += ":" }
	    else {
		ipv6SubPrefix1 += ":";
		ipv6SubPrefix2 += ":";
		ipv6SubPrefixN += ":";
	    }
	} 
	i += 4; // 1 nibble
    }

    document.getElementById("example-subnets").innerHTML = `
    <h2>Beispiel ${ipv6ExamplePrefix}::/${networkBits}</h2>
    <b>1. Subnet:</b> <span class="prefix">${ipv6ExamplePrefix}<span class="subnet-prefix">${ipv6SubPrefix1}:/${totalBits}</span></span></br>
    `;
    if (maxSubnets > 1) {
	document.getElementById("example-subnets").innerHTML += `
    <b>2. Subnet:</b> <span class="prefix">${ipv6ExamplePrefix}<span class="subnet-prefix">${ipv6SubPrefix2}:/${totalBits}</span></span></br>
    `;
    }
    if (maxSubnets > 2) {
	document.getElementById("example-subnets").innerHTML += `
    <b>Letztes Subnet:</b> <span class="prefix">${ipv6ExamplePrefix}<span class="subnet-prefix">${ipv6SubPrefixN}:/${totalBits}</span></span></br>
    `;
    }
}

function updateDisplay() {
    const networkBits = parseInt(document.getElementById("network-prefix-slider").value);
    let subnetBits = parseInt(document.getElementById("subnet-prefix-slider").value);

    const subnetMax = 64 - networkBits;
    if (subnetBits > subnetMax) {
	subnetBits = subnetMax;
	document.getElementById("subnet-prefix-slider").value = subnetBits;
    }

    document.getElementById("subnet-prefix-slider").max = subnetMax;

    const totalBits = networkBits + subnetBits;
    const maxSubnets = Math.pow(2, subnetBits);

    let ipv6Display = "";

    for (let i = 0; i < 64; i++) {
	let backgroundClass = "";

	if (i < networkBits) {
	    backgroundClass = "red-background";
	} else if (i < totalBits) {
	    backgroundClass = "orange-background";
	}

	ipv6Display += `<span class="${backgroundClass}">${i < totalBits ? "1" : "0"}</span>`;
	if (i % 4 === 3) {
	    if (i % 16 === 15) {
		ipv6Display += ":";
	    } else {
		ipv6Display += " ";
	    }
	}
    }

    document.getElementById("ipv6-display").innerHTML = ipv6Display;
    document.getElementById("subnets-count").innerText = maxSubnets.toString();
    document.getElementById("network-prefix-value").innerText = networkBits.toString();
    document.getElementById("subnet-prefix-value").innerText = subnetBits.toString();

    updateExample(networkBits, totalBits,  maxSubnets);
}

// Initialize
updateDisplay();

// Add Event Listeners
document.getElementById("network-prefix-slider").addEventListener("input", updateDisplay);
document.getElementById("subnet-prefix-slider").addEventListener("input", updateDisplay);
document.getElementById("darkmode-button").addEventListener("click", toggleDarkMode);
