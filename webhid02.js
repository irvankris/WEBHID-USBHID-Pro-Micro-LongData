var device=null ;

const reportId = 1;
const INPUT_ENDPOINT = 0x00;
const OUTPUT_ENDPOINT = 0x00;
//const INPUT_ENDPOINT = 0x83;
//const OUTPUT_ENDPOINT = 0x03;
const HID_PKT_SIZE = 64;
const intercommanddelay = 100;


const ku01Button = document.querySelector('#buttonku01');
const VIDText = document.querySelector('#TextVID');
const PIDText = document.querySelector('#TextPID');
const ku02Button = document.querySelector('#buttonku02');
const HEX01Text = document.querySelector('#TextHEX01');

const waitFor = duration => new Promise(r => setTimeout(r, duration));

let outputReportId = 0x00;
let outputReport = new Uint8Array(HID_PKT_SIZE);

function clearoutputReport() {
    for (var i = 0; i < HID_PKT_SIZE; i++) {
			outputReport[i] = 0;			
		
	}

}

clearoutputReport();

function hexStringToArrayBuffer(hexString) {
    // remove the leading 0x
    hexString = hexString.replace(/^0x/, '');
    
    // ensure even number of characters
    if (hexString.length % 2 != 0) {
        console.log('WARNING: expecting an even number of characters in the hexString');
    }
    
    // check for some non-hex characters
    var bad = hexString.match(/[G-Z\s]/i);
    if (bad) {
        console.log('WARNING: found non-hex characters', bad);    
    }
    
    // split the string into pairs of octets
    var pairs = hexString.match(/[\dA-F]{2}/gi);
    
    // convert the octets to integers
    var integers = pairs.map(function(s) {
        return parseInt(s, 16);
    });
    
    var array = new Uint8Array(integers);
    console.log(array);
    
    return array.buffer;
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  // create a byte array (Uint8Array) that we can use to read the array buffer
  const byteArray = new Uint8Array(buffer);
  
  // for each element, we want to get its two-digit hexadecimal representation
  const hexParts = [];
  for(let i = 0; i < byteArray.length; i++) {
    // convert value to hexadecimal
    const hex = byteArray[i].toString(16);
    
    // pad with zeros to length 2
    const paddedHex = ('00' + hex).slice(-2);
    // push to array
    hexParts.push(paddedHex);
		if (i < (byteArray.length - 1 )) {
			//spacer
			hexParts.push(" ");
		}    
  }
  
  // join all the hex values of the elements into a single string
  return hexParts.join('');
}

/*
// EXAMPLE:
const buffer = new Uint8Array([ 4, 8, 12, 16 ]).buffer;
console.log(buf2hex(buffer)); // = 04080c10st PIDText = document.getElementById('TextPID');
*/


function hexToBytes(hex) {
	var newhex = hex.replace(/\s+/g, '')
    for (var bytes = [], c = 0; c < newhex.length; c += 2)
    bytes.push(parseInt(newhex.substr(c, 2), 16));
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
		if (i < (bytes.length - 1 )) {
			//spacer
			hex.push(" ");
		}
    }
    return hex.join("");
}

function onInputReport(event) {
	    let dv = event.data
	  //const dv = await device.receiveReport(outputReportId, HID_PKT_SIZE);
   console.log('Message from BOSS :');
   console.log(buf2hex(dv.buffer))

}




function compileCommand(commandnya) {

    var sendbytes = hexToBytes(commandnya);
	console.log("sendbytes length = " + sendbytes.length);
    for (var i = 0; i < sendbytes.length; i++) {
		if (i < HID_PKT_SIZE) {
			//console.log(sendbytes[i]);
			outputReport[i] = sendbytes[i];			
		}
	}

	
}


const requestDevice = async () =>  {
	document.getElementById("preconnect").innerHTML = "filter to <br>VID :"+ bytesToHex(hexToBytes(VIDText.value))+"<br>PID :" +  bytesToHex(hexToBytes(PIDText.value))+"";

let VIDbuffer = new Uint8Array(hexToBytes(VIDText.value)).buffer;
let VIDdataView = new DataView(VIDbuffer);
let PIDbuffer = new Uint8Array(hexToBytes(PIDText.value)).buffer;
let PIDdataView = new DataView(PIDbuffer);

// get 8-bit number at offset 0
//alert( dataView.getUint8(0) ); // 255

// now get 16-bit number at offset 0, it consists of 2 bytes, together interpreted as 65535
//alert( dataView.getUint16(0) ); // 65535 (biggest 16-bit unsigned int)

	
	
  // Filter on devices 
  const filters = [
    {
 	  //teensy //#usagePage: 0xFFAB, usage: 0x0200	  
      vendorId: VIDdataView.getUint16(0), 
      productId: PIDdataView.getUint16(0), 

	  usagePage: 0xFFAB, 
	  usage: 0x0200 
    },
  ];
  
  // Prompt user to select a Joy-Con device.
  try {
     [device] = await navigator.hid.requestDevice({ filters });
    if (!device) {
		    console.log('chooser dismissed with no selection');
      return;
    }
	
	await device.open();
    if (!device.opened) {
      console.log('open failed');
      //return;
    }
  
   device.oninputreport = onInputReport;
   console.log('Connected to device: ' + device.productName);
   //console.log(device.HIDCollectionInfo);
  
  } catch (error) {
    console.error(error.name, error.message);
  }
};



const  proseskan = async () => {
	//document.getElementById("hasil").innerHTML = "<h3>Hex : "+ bytesToHex(hexToBytes(HEX01Text.value)) + "</h3>";
	
  // Turn off
   console.log('Connected to device: ' + device.productName);


  let HEX01buffer = new Uint8Array(hexToBytes(HEX01Text.value));  
  //let HEX01buffer = new Uint8Array(enableVibrationData);   
  console.log(buf2hex(HEX01buffer)); // PIDText = document.getElementById('TextPID');



//try 
  {
	  

	   
	  //MORE THAN 60 bytes (240 bytes max) read from i2c device 
	  clearoutputReport();
	  compileCommand("0F 19 A7 60 05 00 00 00 00 00 00 00");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await  waitFor(intercommanddelay );	
		
//	  compileCommand("06 00 60 88");
	  clearoutputReport();
	  compileCommand("0F 19 B5 60 08 0D FF 03 07 40 04 02 00 85 07");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay );	

      //read buffer, chunk by chunk	  
	  
	  clearoutputReport();
	  compileCommand("06 16 ab 00");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay ) ;	

	  clearoutputReport();
	  compileCommand("06 16 cd 01");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay ) ;	

	  clearoutputReport();
	  compileCommand("06 16 ef 02");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay ) ;	

	  clearoutputReport();
	  compileCommand("06 16 43 03");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay ) ;		  

	  //MORE THAN 60 bytes (240 bytes max)  WRITE  to i2c device 
      
      //preparing write data 	  
	  //preparing first chunk
	  clearoutputReport();
	//compileCommand("40 23 dd 02 AA 01 02 03 04 05 06 07 08 09 BB 01 02 03 04 05 06 07 08 09 CC 01 02 03 04 05 06 07 08 09 DD 01 02 03 04 05 06 07 08 09 EE 01 02 03 04 05 06 07 08 09 FF 01 02 03 04 05 06 07 08 09 ");
	                            //03 47 16 23 00 00 2b 7e 15 16 28 ae d2 a6 ab f7 15 88 09 cf 4f 3c 6b e1 63 d4 2b 62 3e 70 d1 64 fa 14 5d b1 d4 63 70 58 71 0b 58 e1 e6 65 d3 d2 f5 b4 65 17 64 03 11 44 43 fa 8e 96 14 84 5e c7 29 6c d1 3b c9 dc 64 52
	  compileCommand("40 23 e1 00 03 47 16 23 00 00 2b 7e 15 16 28 ae d2 a6 ab f7 15 88 09 cf 4f 3c 6b e1 63 d4 2b 62 3e 70 d1 64 fa 14 5d b1 d4 63 70 58 71 0b 58 e1 e6 65 d3 d2 f5 b4 65 17 64 03 11 44 43 fa 8e 96 ");							
	  //                          03 47 16 23 00 00 2b 7e 15 16 28 ae d2 a6 ab f7 15 88 09 cf 4f 3c 6b e1 63 d4 2b 62 3e 70 d1 64 fa 14 5d b1 d4 63 70 58 71 0b 58 e1 e6 65 d3 d2 f5 b4 65 17 64 03 11 44 43 fa 8e 96 14 84 5e c7 29 6c d1 3b c9 dc 64 52 d2 a6 ab f7 15 88 09 cf 4f 3c 6b e1 63 d4 2b 62 3e 70 d1 64 fa 14 5d b1 d4 63 70 58 71 0b 58 e1 e6 65 d3 d2 f5 b4 65 17 64 03 11 44 43 fa 8e 96 aa 01 02 03 04 05 06 07
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay );	

	  //preparing second chunk
	  clearoutputReport();
	  compileCommand("40 23 e1 01 14 84 5e c7 29 6c d1 3b c9 dc 64 52 ");							
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay );	

	  clearoutputReport();
	  compileCommand("0F 19 A7 60 05 00 00 00 00 00 00 00");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await  waitFor(intercommanddelay );	
      
      //execute write from prepared data	  
	  clearoutputReport();
	  compileCommand("0F 18 A5 60 48 0D FF 00 00 00 00 00");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay );	

      //read buffer, all at once	  
	  clearoutputReport();
	  compileCommand("06 17 00 ee");
      console.log(buf2hex(outputReport));
	  await device.sendReport(outputReportId,outputReport );
      await waitFor(intercommanddelay ) ;	




  }
}

//ku01Button.addEventListener('click', tampilkan_nama);

ku01Button.addEventListener('click', requestDevice);
ku02Button.addEventListener('click', proseskan);





