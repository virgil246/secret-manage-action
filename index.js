const core = require('@actions/core');
const github = require('@actions/github');
const sodium = require('tweetsodium');


function EncodeSecretValue(key_id, key, value) {
    // Convert the message and key to Uint8Array's (Buffer implements that interface)
    const messageBytes = Buffer.from(value);
    const keyBytes = Buffer.from(key, 'base64');

    // Encrypt using LibSodium.
    const encryptedBytes = sodium.seal(messageBytes, keyBytes);

    // Base64 the encrypted secret
    const encrypted = Buffer.from(encryptedBytes).toString('base64');

    console.log(encrypted);
    return {
        encrypted_value: Buffer.from(encryptedBytes).toString('base64'),
        key_id
    }
}
const boostrap = async (octokit, owner, repo, name, value) => {
    try {
        var res = await octokit.actions.getRepoPublicKey({ owner, repo })
        const key_id = res.data.key_id
        const key = res.data.key
 

        const data = EncodeSecretValue(key_id, key, value)
        if (value.length > 0) {

            res = await octokit.actions.createOrUpdateRepoSecret({  owner,  repo, secret_name: name, data })
            console.log(`Here is response : ${res}`)

            if (res.status >= 400) {
                Core.setFailed(res.data)
              } else {
                Core.setOutput('status', res.status)
                Core.setOutput('data', res.data)
              }
        }
    } catch (error) {
        Core.setFailed(error.message)
        console.error(error)
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
    octokit.actions.createOrUpdateRepoSecret()
    boostrap(octokit, own_repo[0], own_repo[1], name, value)
} catch (error) {
    core.setFailed(error.message);
}
