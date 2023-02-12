# CI pipeline overview

This is an overview of the CI pipeline within starchart

## Concurrency

The `Concurrency` group is used to ensure only one instance of the CI job is running per branch. For example, if 2 commits are pushed in close session to one another, the first commits CI run will be cancelled in favor of the second run.

This is done through defining a concurrency group with a unique identifier: `group: ${{ github.workflow }}-${{ github.ref }}`, in which only 1 CI run can occupy. The newer CI run will always take presence over older runs.

## Jobs

All CI jobs are run concurrently, and utilize caching where possible.

In every job, it will attempt to fetch `node_modules` from a cache, instead of installing it fresh

```yaml
- name: Restore node_modules cache
  id: node_modules-cache-restore
  uses: actions/cache/restore@v3
  with:
    # path to node_modules to cache
    path: ./node_modules
    # cache module with hash of package-lock.json
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

The hash key is the os name followed by the package-lock hash(`Linux-node-63fe6c0ea79bc1812337982f05a442b9a9ee4df56c872a7f4dad8df440079be5`). This is so when app dependencies are updated, and package-lock is regenerated. It will download and cache the newer `node_modules` instead of restoring the older version from cache.

---

The `cache/restore` action exposes a `cache-hit` output, which is set to true when the cache is restored. In the event the cache is not found, `node_modules` must be installed manually in the job:

```yaml
- name: Install node_modules
  # install node modules manually only if cache was not restored
  if: steps.node_modules-cache-restore.outputs.cache-hit != 'true'
  run: npm ci
```

At the end of each job, `node_modules` are put into cache using the same key that was used to restore the cache

```yaml
- name: Cache node_modules
  uses: actions/cache@v3
  with:
    path:
      ./node_modules
      # cache node modules using the same key as restore.
    key: ${{ steps.node_modules-cache-restore.outputs.cache-primary-key }}
```

> **Note** having the CI run concurrently comes at the cost of some boiler plate code shared across all jobs. Each job must perform caching and restoration of `node_modules` it self.
