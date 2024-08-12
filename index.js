const { FFmpeg } = FFmpegWASM;
const filetypes = [["jpeg","webp"],["mp4","webm","gif","avi"],["bmp"]];
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
const createraw = (data)=>{
            
    let buffer = new ArrayBuffer(data.length/2);                                                                                                                                   
    let dv = new DataView(buffer);
    for(let i=0;i<data.length/2;i++){    
        dv.setUint8(i, parseInt(data.charAt(i*2)+data.charAt(i*2+1),16));
    }
    return buffer;

}
window.onload = async()=> {
    const zip = new JSZip();

    const d = document.getElementById("input");
    const ffmpeg = new FFmpeg();
    d.addEventListener("change",event =>{
        const file = event.target.files[0];
        const reader = new FileReader();
        const tip = document.getElementById("tip");
        reader.onload=async()=>{
            //Get options
            const fps = document.getElementById("fps").value;
            const filetype = document.getElementById("filetype").value;
            
            //Load FFmpeg
            tip.innerText="Loading FFmpeg...";
            ffmpeg.on("log", ({ type, message }) => {
                console.log(type+" "+message);
              });
              ffmpeg.on("progress", ({ progress, time }) => {
                console.log(time+" "+progress);
              });
            if(filetype!=="bmp"){
                await ffmpeg.load({coreURL:`https://frezledz.github.io/SCtomedia/assets/core/dist/umd/ffmpeg-core.js`,log:true});
            }

            //Parse file
            const datas = dataparser(reader.result.split("\r\n"));

            //convert to webp sequence to avoid memory runout as much as possible
            let files=[];
            if(filetype!=="bmp"){
                //create sequence
                let seqtype;
                if(seqtype=="webp"){
                    seqtype="webp";
                }else{
                    seqtype="jpeg";
                }
                for(let i=0;i<datas.length;i++){
                    tip.innerText=`Writing dataset to memory, ${i}/${datas.length} done...`;
                    const buffer = createraw(datas[i]);
                    await ffmpeg.writeFile("input.bmp",new Uint8Array(buffer));
                    await ffmpeg.exec(["-i","input.bmp", `sequence${i+1}.jpeg`]);
                    await ffmpeg.deleteFile("input.bmp");
    
                }
                if(filetypes[1].indexOf(filetype)!=-1){
                    //video
                    tip.innerText=`Creating video...`;
                    await ffmpeg.exec(["-i", "sequence%d.jpeg","-r",fps,`video.${filetype}`]);
                    const load =await ffmpeg.readFile(`video.${filetype}`);
                    files.push(load);
                    for(let i=0;i<datas.length;i++){
                        await ffmpeg.deleteFile(`sequence${i+1}.jpeg`);
                    }

                }else{
                    //sequence
                    for(let i=0;i<datas.length;i++){
                        tip.innerText=`Writing image sequence...`;
                        const load = await ffmpeg.readFile(`sequence${i+1}.${seqtype}`);
                        files.push(load);
                        
                    }
                }

            }else{
                //bmp
                for(let i=0;i<datas.length;i++){
                    files.push(new Uint8Array(createraw(datas[i])));
                }

            }
            //Create zip file 
            for(let i=0;i<files.length;i++){
                let filename;
                if(filetypes[1].indexOf(filetype)==-1){
                    filename=`sequence${i+1}.${filetype}`;
                }else{
                    filename=`video.${filetype}`;
                }
                zip.file(filename,files[i],{binary:true});
                
            }
            tip.innerText=`Creating your zip file...`;
            zip.generateAsync({type:"blob"}).then(content=>{
                saveAs(content,"Video.zip");
                tip.innerText="Completed! The file will be saved automatically.";

            })

        }
        reader.readAsText(file);
    })                                                                                         
    
    
};
