const { FFmpeg } = FFmpegWASM;
const { fetchFile } = FFmpegUtil;
window.onload = async()=> {
    const d = document.getElementById("input");
    const ffmpeg = new FFmpeg();
    d.addEventListener("change",event =>{
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload=async()=>{
            const data = reader.result.split("\n");
            let buffer = new ArrayBuffer(data.length);                                                                                                                                   
            let dv = new DataView(buffer);
            for(let i=0;i<data.length;i++){                                     
                dv.setUint8(i, parseInt(data[i],16));
            }
            
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            //const fetched =await (await fetch("./test.webp")).arrayBuffer();
            let blob = new Blob([buffer], {type: "image/bmp"});
            const fetched = await blob.arrayBuffer();
            url = window.URL.createObjectURL(blob);
            const tip = document.createElement("p");
            tip.innerText="loading ffmpeg..."
            document.body.appendChild(tip);
            a.href = url;
            a.download = "test";
            
            
            /*
            await ffmpeg.load();
            //await ffmpeg.FS("writeFile","test.bmp",new Uint8Array(fetched));
            await ffmpeg.write("test.bmp",url);
            console.log(ffmpeg.FS('ls', '/'));
            //MEMFSに保存がこれでできているのかが分からない、いやbmpファイルに対応していない説
            const load = await ffmpeg.read("test.bmp");
            */
            ffmpeg.on("log", ({ type, message }) => {
                console.log(type+" "+message);
              })
              ffmpeg.on("progress", ({ progress, time }) => {
                console.log(time+" "+progress);
              })
            await ffmpeg.load({coreURL:`/node_modules/@ffmpeg/core/dist/umd/ffmpeg-core.js`,log:true});
            await ffmpeg.writeFile("test.bmp",/*await fetchFile("http://127.0.0.1:5500/test.webp")*/new Uint8Array(fetched));
            await ffmpeg.exec(["-i","test.bmp", "test.webp"]);
            const load = await ffmpeg.readFile("test.webp");
            blob = new Blob([load],{type: "image/webp"});
            url = window.URL.createObjectURL(blob);
            const element = document.createElement("img");
            element.setAttribute("src",url);
            document.body.appendChild(element);
            //element.click();
        }
        reader.readAsText(file);
    })                                                                                         
    
    
};