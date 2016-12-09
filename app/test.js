var fs = require('fs');
var XmlStream = require('xml-stream');

// Pass the ReadStream object to xml-stream
var stream = fs.createReadStream('wildberries-ru_products_20161106_002302.xml');
var xml = new XmlStream(stream);

// xml._stream.bytesRead = 65536;


// console.log(xml);
xml.on('endElement: offer', function (item) {

    console.log(xml._stream.bytesRead);
    console.log(item.name);
    xml.pause();
    // console.log(item);

});
