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
        encrypted: Buffer.from(encryptedBytes).toString('base64'),
        key_id
    }
}
const boostrap = async (octokit, owner, repo, name, value) => {
    try {
        var res = await octokit.actions.getRepoPublicKey({ owner, repo })
        const key_id = res.data.key_id
        const key = res.data.key
        console.log(value)

        const data = EncodeSecretValue(key_id, key, value)
        if (value.length > 0) {
            console.log(name)

            res = await octokit.actions.createOrUpdateRepoSecret({ owner: owner, repo: repo, name: name, data })


            console.log(res)
        }
    } catch (error) {
        console.log(error)
    }


}
try {
    // `who-to-greet` input defined in action metadata file
    const own_repo = core.getInput('repo').split('/');
    const token = core.getInput('token');
    const name = core.getInput('name');
    console.log(name)
    const value = core.getInput('value');
    const myToken = core.getInput('myToken');
    console.log(myToken)
    const octokit = github.getOctokit(token)
    boostrap(octokit, own_repo[0], own_repo[1], name, value)
} catch (error) {
    core.setFailed(error.message);
}
