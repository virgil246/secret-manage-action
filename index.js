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
        encrypted,
        key_id
    }
}
try {
    // `who-to-greet` input defined in action metadata file
    const { owner, repo } = core.getInput('repo').split("/");
    const token = core.getInput('token');
    const name = core.getInput('name')
    const value = core.getInput('value');
    const myToken = core.getInput('myToken');

    const octokit = github.getOctokit(token)
    const { key_id, key } = await octokit.actions.getRepoPublicKey({ owner, repo })
    const data = EncodeSecretValue(key_id, key, value)
    if (value.length > 0) {
        res = await octokit.actions.createOrUpdateRepoSecret({ owner, repo, name, data })
        console.log(res)
    }
} catch (error) {
    core.setFailed(error.message);
}
