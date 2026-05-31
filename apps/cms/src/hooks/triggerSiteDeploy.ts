import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

async function postWebhook(payload: Record<string, unknown>) {
  const url = process.env.SITE_DEPLOY_WEBHOOK_URL
  if (!url) return

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (process.env.SITE_DEPLOY_WEBHOOK_SECRET) {
    headers['x-site-deploy-secret'] = process.env.SITE_DEPLOY_WEBHOOK_SECRET
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('Failed to trigger site deploy webhook.', error)
  }
}

export const triggerSiteDeployAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  operation,
}) => {
  await postWebhook({
    kind: 'collection',
    operation,
    collection: collection.slug,
    docId: doc.id,
  })

  return doc
}

export const triggerSiteDeployAfterDelete: CollectionAfterDeleteHook = async ({
  collection,
  id,
}) => {
  await postWebhook({
    kind: 'collection',
    operation: 'delete',
    collection: collection.slug,
    docId: id,
  })
}

export const triggerSiteDeployAfterGlobalChange: GlobalAfterChangeHook = async ({
  global,
  doc,
}) => {
  await postWebhook({
    kind: 'global',
    operation: 'update',
    global: global.slug,
    docId: doc.id,
  })

  return doc
}
