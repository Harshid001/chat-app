const ImageKit = require('@imagekit/nodejs');
const {toFile} = require('@imagekit/nodejs');
const pkey = process.env.IMAGEKIT_KEY;
const imagekit = new ImageKit({
    privateKey : pkey
});


function hasImageKitConfig(){
    return Boolean(pkey);
};

//get unique and safe name for files that would be uploaded
function createFileName(originalName = 'upload'){
    const safeName = originalName.replace(/[^a-zA-z0-9._-]/g,'_');
    return `chat-${Date.now()}-${safeName}` 
}
async function uploadChatMedia(file){
    const fileName = createFileName(file.originalName);
    const result = await imagekit.file.upload({
        file : await toFile(file.buffer,fileName,{type:file.mimetype}),
        fileName,
        folder:'/chatsdata'
    });
    return result.url;
};

module.export= {uploadChatMedia,hasImageKitConfig};