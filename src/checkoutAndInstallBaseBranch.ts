import { info, startGroup, endGroup } from '@actions/core'
import { exec, ExecOptions } from '@actions/exec'
import { Context } from '@actions/github/lib/context'

interface Cfg {
    installScript: string
    payload: Context['payload']
    execOptions: ExecOptions
}
/**
 * Checkout base branch of the pr, install dependencies
 */
export async function checkoutAndInstallBaseBranch({ installScript, payload, execOptions }: Cfg): Promise<void> {
    startGroup(`[base branch] Checkout target branch`)
    try {
        await exec(`git fetch -n origin ${payload.pull_request!.base.sha}`)
        info('successfully fetched base.sha')
    } catch (errFetchBaseSha) {
        info(`fetching base.sha failed ${(errFetchBaseSha as Error).message}`)
        try {
            await exec(`git fetch -n`)
        } catch (errFetch) {
            info(`fetch failed ${(errFetch as Error).message}`)
        }
    }

    info('checking out and building base commit')
    await exec(`git reset --hard ${payload.pull_request!.base.sha}`)
    endGroup()

    startGroup(`[base branch] Install Dependencies`)
    await exec(installScript, [], execOptions)
    endGroup()
}
