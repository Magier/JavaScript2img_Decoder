# JavaScript2img_Decoder

This is a simple script to deobfuscate code, which was obfuscated with JavaScript2img (http://javascript2img.com) - 'The Best and Simplest Javascript Obfuscator'.
The only existing 'decoder' so far execute the code and catch it before it's called by eval in the final step. This may backfire, if the sample code was crafted with malicious intend.
This version decodes the sample without executing it, thus it's safe to use in any environment.

The decoder depends on two other modules: 
 - pngjs: the actual obfuscated code is stored as PNG. This library helps to retrieve the bytes in the correct order
 - atob: used to decode the base64 encoded snippets, that obfuscate the data.
