const { FFmpeg } = FFmpegWASM;
const dataparser = (data)=>{
    let datasets=[];
    let str="";
    for(let i=0;i<data.length;i++){
        if(data[i]=="S"){
            datasets.push(str);
            str="";
        }else{
            str+=data[i];
        }
    }
    return datasets;
}
window.onload = async()=> {
    const d = document.getElementById("input");
    const ffmpeg = new FFmpeg();
    d.addEventListener("change",event =>{
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload=async()=>{
            const data = dataparser(reader.result.split("\r\n"))[0];
            const tip = document.createElement("p");
            document.body.appendChild(tip);
            tip.innerText="Creating raw data...";
            let buffer = new ArrayBuffer(data.length/2);                                                                                                                                   
            let dv = new DataView(buffer);
            for(let i=0;i<data.length/2;i++){    
                dv.setUint8(i, parseInt(data.charAt(i*2)+data.charAt(i*2+1),16));
            }
            const a = document.createElement("a");
            document.body.appendChild(a);
            let blob = new Blob([buffer], {type: "image/bmp"});
            const fetched = await blob.arrayBuffer();
            url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = "test";
            ffmpeg.on("log", ({ type, message }) => {
                console.log(type+" "+message);
              })
              ffmpeg.on("progress", ({ progress, time }) => {
                console.log(time+" "+progress);
              })
              tip.innerText="Loading FFmpeg...";
            await ffmpeg.load({coreURL:`https://xxxfreezerxxx.github.io/SCtomedia/assets/core/dist/umd/ffmpeg-core.js`,log:true});
            tip.innerText="Converting...";
            await ffmpeg.writeFile("test.bmp",new Uint8Array(fetched));
            await ffmpeg.exec(["-i","test.bmp", "test.webp"]);
            const load = await ffmpeg.readFile("test.webp");
            blob = new Blob([load],{type: "image/webp"});
            url = window.URL.createObjectURL(blob);
            const element = document.createElement("img");
            element.setAttribute("src",url);
            document.body.appendChild(element);
            element.download=true;
            tip.innerText="Completed! Right click to save.";
        }
        reader.readAsText(file);
    })                                                                                         
    
    
};