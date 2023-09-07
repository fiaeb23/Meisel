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
}

document.addEventListener("DOMContentLoaded", () => {
    const body = document.getElementById("body");
    const networkSlider = document.getElementById("network-slider");
    const subnetSlider = document.getElementById("subnet-slider");
    const networkValue = document.getElementById("network-value");
    const subnetValue = document.getElementById("subnet-value");
    const output = document.getElementById("output");
    const info = document.getElementById("info");
    const DarkModeButton = document.getElementById("toggle-dark-mode");

// Darkmode
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        darkMode = true;
        document.body.classList.add('dark-mode');
    } else if (savedDarkMode === 'disabled') {
        darkMode = false;
        document.body.classList.remove('dark-mode');
    }

    const updateBits = () => {
	let networkBits = parseInt(networkSlider.value);
	let subnetBits = parseInt(subnetSlider.value);
	let hostBits = 32 - networkBits - subnetBits;

	networkValue.innerText = networkBits;
	subnetValue.innerText = subnetBits;
	subnetSlider.setAttribute("max", 32 - networkBits - 1);

	let bits = "";
	for (let i = 0; i < 32; i++) {
	    if (i % 4 === 0 && i !== 0){
		if (i % 8 === 0 && i !== 0){
		    bits += ".";
		}else{
		    bits += " ";
		}}

	    if (i < networkBits) {
		bits += `<span class="red">1</span>`;
	    } else if (i < networkBits + subnetBits) {
		bits += `<span class="orange">1</span>`;
	    } else {
		bits += `<span class="green">1</span>`;
	    }
	}
	output.innerHTML = bits;

	let numSubnets = Math.pow(2, subnetBits);
	let numIPs = Math.pow(2, hostBits);
	let numHosts = numIPs - 2;

	info.innerHTML = `<b>Anzahl der Subnets:</b> ${numSubnets}, <b>Anzahl der IPs:</b> ${numIPs}, <b>Anzahl der Hosts:</b> ${numHosts}`;
    };

    DarkModeButton.addEventListener("click", () => {
	toggleDarkMode();
    });

    networkSlider.addEventListener("input", updateBits);
    subnetSlider.addEventListener("input", updateBits);

    const exampleH = document.getElementById("Beispiel");
    const example = document.getElementById("example");

    const calculateSubnet = (baseIP, networkBits, subnetBits, subnetIndex) => {
	const totalBits = networkBits + subnetBits;
	const subnetSize = Math.pow(2, 32 - totalBits);
	
	const subnetBase = subnetIndex * subnetSize;
	const networkBase = parseInt(baseIP.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join(''), 2);

	const subnetNetwork = networkBase + subnetBase;
	const subnetBroadcast = subnetNetwork + subnetSize - 1;
	
	return {
	    network: [(subnetNetwork >> 24) & 255, (subnetNetwork >> 16) & 255, (subnetNetwork >> 8) & 255, subnetNetwork & 255].join('.'),
	    broadcast: [(subnetBroadcast >> 24) & 255, (subnetBroadcast >> 16) & 255, (subnetBroadcast >> 8) & 255, subnetBroadcast & 255].join('.'),
	    firstHost: [(subnetNetwork >> 24) & 255, (subnetNetwork >> 16) & 255, (subnetNetwork >> 8) & 255, (subnetNetwork & 255) + 1].join('.'),
	    lastHost: [(subnetBroadcast >> 24) & 255, (subnetBroadcast >> 16) & 255, (subnetBroadcast >> 8) & 255, (subnetBroadcast & 255) - 1].join('.')
	};
    };
    
    // Function to convert CIDR to subnet mask in decimal
    const cidrToSubnetMask = (cidr) => {
	const mask = [];
	for (let i = 0; i < 4; i++) {
	    let n = Math.min(cidr, 8);
	    mask.push(256 - Math.pow(2, 8 - n));
	    cidr -= n;
	}
	return mask.join('.');
    };	

    const updateExample = () => {
	const baseIP = "10.0.0.0";
	const networkBits = parseInt(networkSlider.value);
	const subnetBits = parseInt(subnetSlider.value);
	const subnetMask = cidrToSubnetMask(networkBits + subnetBits);
	const numSubnets = Math.pow(2, subnetBits);

	const firstSubnet = calculateSubnet(baseIP, networkBits, subnetBits, 0);
	const secondSubnet = calculateSubnet(baseIP, networkBits, subnetBits, 1);
	const lastSubnet = calculateSubnet(baseIP, networkBits, subnetBits, numSubnets - 1);

	
	exampleH.innerHTML = `
        <h3>Beispiel basierend auf IP ${baseIP}</h3>
  `;
	example.innerHTML = `
      <div class="cell"><h4>Erstes Subnet:</h4>
        <b>Netzwerkadresse:</b> ${firstSubnet.network}/${networkBits + subnetBits},</br>
        <b>Subnetzmaske:</b> ${subnetMask},</br>
        <b>Erster Host:</b> ${firstSubnet.firstHost},</br>
        <b>Letzter Host:</b> ${firstSubnet.lastHost},</br>
        <b>Broadcast:</b> ${firstSubnet.broadcast}</br>
      </div>
  `;
	if (numSubnets > 1)	{
	    example.innerHTML += `
      <div class="cell"><h4>Zweites Subnet:</h4>
        <b>Netzwerkadresse:</b> ${secondSubnet.network}/${networkBits + subnetBits},</br>
        <b>Subnetzmaske:</b> ${subnetMask},</br>
        <b>Erster Host:</b> ${secondSubnet.firstHost},</br>
        <b>Letzter Host:</b> ${secondSubnet.lastHost},</br>
        <b>Broadcast:</b> ${secondSubnet.broadcast}</br>
      </div>
  `;}
if (numSubnets > 2)	{
	example.innerHTML += `
      <div class="cell"><h4>Letztes Subnet:</h4>
        <b>Netzwerkadresse:</b> ${lastSubnet.network}/${networkBits + subnetBits},</br>
        <b>Subnetzmaske:</b> ${subnetMask},</br>
        <b>Erster Host:</b> ${lastSubnet.firstHost},</br>
        <b>Letzter Host:</b> ${lastSubnet.lastHost},</br>
        <b>Broadcast:</b> ${lastSubnet.broadcast}</br>
      </div>
  `;}
};
    
    networkSlider.addEventListener("input", () => {
	updateBits();
	updateExample();
    });

    subnetSlider.addEventListener("input", () => {
	updateBits();
	updateExample();
    });

    updateBits();
    updateExample();
});




