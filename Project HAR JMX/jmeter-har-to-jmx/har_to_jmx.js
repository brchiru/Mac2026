//We must escape XML special characters before writing them into the JMX.
function xmlEscape(value) {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

//Detect POST data in JavaScript Object
function hasPostData(entry) 
{
    return(entry.request.method === 'POST' && 
        entry.request.postData
    );
}

//Handle Form Data function
function buildFormArguments(postData){
    if(!postData.params) return "";

    let args = "";
    for(const param of postData.params){
        args += `
            <elementProp name="${xmlEscape(param.name)}" elementType="HTTPArgument">
              <boolProp name="HTTPArgument.always_encode">false</boolProp>
              <stringProp name="Argument.name">${xmlEscape(param.name)}</stringProp>
              <stringProp name="Argument.value">${xmlEscape(param.value)}</stringProp>
              <stringProp name="Argument.metadata">=</stringProp>
            </elementProp>
        `;
    }
    return args;
} 
//Handle JSON Body function 
function buildPostBody(postData){
    if(!postData.text) return "";

    return `
        <boolProp name="HTTPSampler.postBodyRaw">true</boolProp>
        <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
          <collectionProp name="Arguments.arguments">
            <elementProp name="" elementType="HTTPArgument">
              <boolProp name="HTTPArgument.always_encode">false</boolProp>
              <stringProp name="Argument.name"></stringProp>
              <stringProp name="Argument.value">${xmlEscape(postData.text)}</stringProp>
              <stringProp name="Argument.metadata">=</stringProp>
            </elementProp>
          </collectionProp>
        </elementProp> 
    `;
}

const fs = require('fs');

// 1️⃣ Read HAR file
const har = JSON.parse(fs.readFileSync('input/WebTours.har', 'utf8'));

// 2️⃣ Extract entries
const entries = har.log.entries;

console.log(`Total entries in HAR: ${entries.length}`);

// 3️⃣ Filter unwanted resources
const filtered = entries.filter(e => {
    const url = e.request.url;
    return !(url.endsWith('.css') || url.endsWith('.js') || url.endsWith('.png') || url.endsWith('.jpg')|| url.endsWith('.gif') || url.endsWith('.svg') || url.endsWith('.woff') || url.endsWith('.ttf'));
});

// 4️⃣ Start building JMX structure
function buildJmxHeader() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
  <hashTree>
    <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="HAR Converted Test Plan" enabled="true">
      <stringProp name="TestPlan.comments"></stringProp>
      <boolProp name="TestPlan.functional_mode">false</boolProp>
      <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
    </TestPlan>
    <hashTree>
      <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Users" enabled="true">
        <stringProp name="ThreadGroup.num_threads">1</stringProp>
        <stringProp name="ThreadGroup.ramp_time">1</stringProp>
        <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
        <stringProp name="ThreadGroup.duration"></stringProp>
        <stringProp name="ThreadGroup.delay"></stringProp>
        <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
          <boolProp name="LoopController.continue_forever">false</boolProp>
          <stringProp name="LoopController.loops">1</stringProp>
        </elementProp>
      </ThreadGroup>
      <hashTree>
`;
}


// let jmx = `<?xml version="1.0" encoding="UTF-8"?>
// <jmeterTestPlan version="1.2" properties="5.0" jmeter="5.6.3">
//   <hashTree>
//     <TestPlan guiclass="TestPlanGui" testclass="TestPlan" testname="HAR Converted Test Plan" enabled="true">
//       <stringProp name="TestPlan.comments"></stringProp>
//       <boolProp name="TestPlan.functional_mode">false</boolProp>
//       <boolProp name="TestPlan.serialize_threadgroups">false</boolProp>
//     </TestPlan>
//     <hashTree>
//       <ThreadGroup guiclass="ThreadGroupGui" testclass="ThreadGroup" testname="Users" enabled="true">
//         <stringProp name="ThreadGroup.num_threads">1</stringProp>
//         <stringProp name="ThreadGroup.ramp_time">1</stringProp>
//         <boolProp name="ThreadGroup.same_user_on_next_iteration">true</boolProp>
//         <stringProp name="ThreadGroup.duration"></stringProp>
//         <stringProp name="ThreadGroup.delay"></stringProp>
//         <elementProp name="ThreadGroup.main_controller" elementType="LoopController">
//           <boolProp name="LoopController.continue_forever">false</boolProp>
//           <stringProp name="LoopController.loops">1</stringProp>
//         </elementProp>
//       </ThreadGroup>
//       <hashTree>
// `;

// 5️⃣ Add HTTP Requests
function buildHTTPSampler(entry) 
{
    const url = new URL(entry.request.url);

    let postSection = "";

    if (hasPostData(entry)){ // Handle POST data RAW JSON body
       const postData = entry.request.postData
        if (postData.mimeType && postData.mimeType.includes('application/json')){
            postSection = buildPostBody(postData);
        }
        else{ // Handle Form Data
            postSection = `
                <elementProp name="HTTPsampler.Arguments" elementType="Arguments">
                  <collectionProp name="Arguments.arguments">
                    ${buildFormArguments(postData)}
                  </collectionProp>
                </elementProp>
            `; 
        }
    } 
    return `
        <HTTPSamplerProxy guiclass="HttpTestSampleGui" 
                            testclass="HTTPSamplerProxy" 
                            testname="${xmlEscape(entry.request.method)} ${xmlEscape(url.pathname)}" 
                            enabled="true">
            <stringProp name="HTTPSampler.domain">${xmlEscape(url.hostname)}</stringProp>
            <stringProp name="HTTPSampler.port">${xmlEscape(url.port || "")}</stringProp>
            <stringProp name="HTTPSampler.protocol">${xmlEscape(url.protocol.replace(':', ''))}</stringProp>
            <stringProp name="HTTPSampler.path">${xmlEscape(url.pathname + url.search)}</stringProp>
            <stringProp name="HTTPSampler.method">${xmlEscape(entry.request.method)}</stringProp>
            <boolProp name="HTTPSampler.follow_redirects">true</boolProp>
            <boolProp name="HTTPSampler.auto_redirects">false</boolProp>
            <boolProp name="HTTPSampler.use_keepalive">true</boolProp>
            <boolProp name="HTTPSampler.DO_MULTIPART_POST">false</boolProp>

            ${postSection}

            </HTTPSamplerProxy>
            <hashTree/>
        `; 
}

let jmx = buildJmxHeader();

filtered.forEach(entry => {
    jmx +=  buildHTTPSampler(entry);
});

jmx += buildJmxFooter();
// 6️⃣ Close JMX structure
// jmx += `
//       </hashTree>
//     </hashTree>
//   </hashTree>
// </jmeterTestPlan>
// `;
function buildJmxFooter() {
    return `
      </hashTree>
    </hashTree>
  </hashTree>
</jmeterTestPlan>
`;
}


// Function to create a Regex Extractor for dynamic values
function buildCorrelationExtractor(variableName, regex) {
    // variableName -> the name of the JMeter variable, e.g., userSession
    // regex -> the regex to extract the value from response
    return `
<RegexExtractor guiclass="RegexExtractorGui" testclass="RegexExtractor" testname="Extract ${variableName}" enabled="true">
  <stringProp name="RegexExtractor.refname">${variableName}</stringProp>
  <stringProp name="RegexExtractor.regex">${regex}</stringProp>
  <stringProp name="RegexExtractor.template">$1$</stringProp>
  <stringProp name="RegexExtractor.default">NOT_FOUND</stringProp>
  <stringProp name="RegexExtractor.match_number">1</stringProp>
</RegexExtractor>
<hashTree/>
`;
}


fs.writeFileSync('output/WebTours.jmx', jmx, 'utf8');
console.log('✅ JMX file created at output/WebTours.jmx');