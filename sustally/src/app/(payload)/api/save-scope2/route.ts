import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { APIError } from 'payload'

export const OPTIONS = async (request: Request) => {
  // Handle CORS preflight
  const origin = request.headers.get('origin')
  const corsOriginsEnv = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'
  const allowedOrigins = corsOriginsEnv.split(',').map(origin => origin.trim())

  const headers = new Headers()
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Credentials', 'true')
  }
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  headers.set('Access-Control-Max-Age', '86400')

  return new Response(null, { status: 200, headers })
}

export const POST = async (request: Request) => {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const data = await request.json()

    // Validate required fields
    if (!data.facilityName) {
      throw new APIError('Facility Name is required', 400)
    }

    // Prepare the data for Payload
    const scope2Data = {
      state: data.state || '',
      siteCount: data.siteCount || '',
      facilityName: data.facilityName || '',
      renewableProcurement: data.renewableProcurement || '',
      onsiteExportedKwh: data.onsiteExportedKwh || '',
      netMeteringApplicable: data.netMeteringApplicable || '',
      reportingYear: data.reportingYear || '',
      reportingPeriod: data.reportingPeriod || '',
      conditionalApproach: data.conditionalApproach || '',
      scopeBoundaryNotes: data.scopeBoundaryNotes || '',
      energyActivityInput: data.energyActivityInput || '',
      energyCategory: data.energyCategory || '',
      trackingType: data.trackingType || '',
      energySupportingEvidenceFile: data.energySupportingEvidenceFile || '',
      energySourceDescription: data.energySourceDescription || '',
      hasRenewableElectricity: data.hasRenewableElectricity || '',
      renewableElectricity: data.renewableElectricity || '',
      renewableEnergyConsumption: data.renewableEnergyConsumption || '',
      renewableSupportingEvidenceFile: data.renewableSupportingEvidenceFile || '',
      renewableEnergySourceDescription: data.renewableEnergySourceDescription || '',
    }

    // Create the scope2 application in Payload
    const created = await payload.create({
      collection: 'scope2-applications',
      data: scope2Data,
    })

    // Get origin for CORS
    const origin = request.headers.get('origin')
    const corsOriginsEnv = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'
    const allowedOrigins = corsOriginsEnv.split(',').map(origin => origin.trim())

    const headers = new Headers({
      'Content-Type': 'application/json',
    })

    // Add CORS headers
    if (origin && allowedOrigins.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin)
      headers.set('Access-Control-Allow-Credentials', 'true')
    }
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return Response.json({
      success: true,
      message: 'Scope 2 application saved successfully',
      id: created.id,
    }, { headers })
  } catch (error) {
    console.error('Error saving scope2 application:', error)
    
    // Get origin for CORS
    const origin = request.headers.get('origin')
    const corsOriginsEnv = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001'
    const allowedOrigins = corsOriginsEnv.split(',').map(origin => origin.trim())

    const errorHeaders = new Headers({
      'Content-Type': 'application/json',
    })

    // Add CORS headers to error response
    if (origin && allowedOrigins.includes(origin)) {
      errorHeaders.set('Access-Control-Allow-Origin', origin)
      errorHeaders.set('Access-Control-Allow-Credentials', 'true')
    }
    errorHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    errorHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    if (error instanceof APIError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status, headers: errorHeaders }
      )
    }

    // Extract error message from the error object
    let errorMessage = 'Failed to save scope 2 application'
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String(error.message) || errorMessage
    }

    return Response.json(
      { success: false, error: errorMessage },
      { status: 500, headers: errorHeaders }
    )
  }
}
