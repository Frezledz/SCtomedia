window.onload = function() {
    const d = document.getElementById("input");
    d.addEventListener("change",event =>{
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload=()=>{
            const data = reader.result.split("\n");
            let buffer = new ArrayBuffer(data.length);                                                                                                                                   
            let dv = new DataView(buffer);
            for(let i=0;i<data.length;i++){                                     
                dv.setUint8(i, parseInt(data[i],16));
            }
            
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            var blob = new Blob([buffer], {type: "image/bmp"}),
            url = window.URL.createObjectURL(blob);
            const element = document.createElement("img");
            element.setAttribute("src",url);
            document.body.appendChild(element);
            const tip = document.createElement("p");
            tip.innerText="Right click the image to save. 画像を右クリックすると保存ができます。"
            document.body.appendChild(tip);
            a.href = url;
            a.download = "test";
            //a.click();
        }
        reader.readAsText(file);
    })                                                                                         
    
    
};