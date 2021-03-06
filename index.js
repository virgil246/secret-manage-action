const core = require('@actions/core');
const github = require('@actions/github');
const sodium = require('tweetsodium');


process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

function EncodeSecretValue(key_id, key, value) {
    // Convert the message and key to Uint8Array's (Buffer implements that interface)
    const messageBytes = Buffer.from(value);
    const keyBytes = Buffer.from(key, 'base64');

    // Encrypt using LibSodium.
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);

    // Base64 the encrypted secret
//     const encrypted = Buffer.from(encryptedBytes).toString('base64');

    return {
        encrypted_value: Buffer.from(encryptedBytes).toString('base64'),
        key_id
    }
}
/**
 * @param {String} owner 
 * @param {String} repo 
 * @param {String} name
 * @param {String} value  
 */
const boostrap = async (octokit, owner, repo, name, value) => {
    try {
        var res = await octokit.actions.getRepoPublicKey({ owner, repo }).catch((error) => { 
            console.log(error.message);
            core.setFailed(error.message) })
        const key_id = res.data.key_id
        const key = res.data.key


        const data = EncodeSecretValue(key_id, key, value)
        if (value.length > 0) {

            res = await octokit.actions.createOrUpdateRepoSecret({ owner, repo, secret_name: name, data }).catch((error) => { 
                console.log(error.message);
                core.setFailed(error.message) })

            if (res.status >= 400) {
                core.setFailed(res.data)
            } else {
                core.setOutput('code', res.status)
                core.setOutput('data', res.data)
            }
        }
    } catch (error) {
        console.error(error)
        core.setFailed(error.message)
        
    }

}
try {
    // `who-to-greet` input defined in action metadata file
    const own_repo = core.getInput('repo').split('/');
    const token = core.getInput('token');
    const name = core.getInput('name');
    const value = core.getInput('value');
    const myToken = core.getInput('myToken');
    const octokit = github.getOctokit(token)
    boostrap(octokit, own_repo[0], own_repo[1], name, value).catch((error) => {
        console.log(error.message);
        core.setFailed(error.message)})
} catch (error) {
    core.setFailed(error.message);
}
