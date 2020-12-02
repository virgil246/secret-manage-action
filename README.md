# Set & Update Repo Secret action

This action is help to update Secret within the action
## Inputs

### `repo`

**Required** The name of the repo `virgil246/secret-manage-action`.

### `token` 
**Required** The PAT key of repo `${ secret.REPO_KEY }`.

### `name`
**Required** The name of Secret

### `value`
The value of Secret

## Outputs
### `status`
Response status code

### `data`
Response json payload




## Example usage

```
uses: virgil246/secret-manage-action@v1.0
with:
  repo:'virgil246/secret-manage-action'
  token:${secret.REPO_KEY}
  name: 'Your-cookie-name' 
  value: 'Your-cookie-value'
```
  