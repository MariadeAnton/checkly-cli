import { Ref } from './ref'
import { Construct } from './construct'
import { AlertChannel } from './alert-channel'
import { EnvironmentVariable } from './environment-variable'
import { AlertChannelSubscription } from './alert-channel-subscription'
import { Session } from './project'
import { CheckConfigDefaults } from '../services/checkly-config-loader'

export interface CheckProps {
  /**
   *  The name of the check.
   */
  name: string
  /**
   *  Determines if the check is running or not.
   */
  activated?: boolean
  /**
   * Determines if any notifications will be send out when a check fails and/or recovers.
   */
  muted?: boolean
  /**
   * Setting this to "true" will trigger a retry when a check fails from the failing region and another,
   * randomly selected region before marking the check as failed.
   */
  doubleCheck?: boolean
  /**
   * Allows to invert the behaviour of when a check is considered to fail. Allows for validating error status like 404.
   */
  shouldFail?: boolean
  /**
   * The runtime version, i.e. fixed set of runtime dependencies, used to execute this check.
   */
  runtimeId?: string
  /**
   * An array of one or more data center locations where to run this check.
   */
  locations?: Array<string>
  /**
   * An array of one or more private locations where to run the check.
   */
  privateLocations?: Array<string>
  /**
   * Tags for organizing and filtering checks.
   */
  tags?: Array<string>
  /**
   * How often the check should run in minutes.
   */
  frequency?: number
  environmentVariables?: Array<EnvironmentVariable>
  /**
   * The id of the check group this check is part of.
   */
  groupId?: Ref
  /**
   * List of alert channel subscriptions.
   */
  alertChannels?: Array<AlertChannel>
}

// This is an abstract class. It shouldn't be used directly.
export abstract class Check extends Construct {
  name: string
  activated?: boolean
  muted?: boolean
  doubleCheck?: boolean
  shouldFail?: boolean
  runtimeId?: string
  locations?: Array<string>
  privateLocations?: Array<string>
  tags?: Array<string>
  frequency?: number
  environmentVariables?: Array<EnvironmentVariable>
  groupId?: Ref
  alertChannels?: Array<AlertChannel>
  __checkFilePath?: string // internal variable to filter by check file name from the CLI

  static readonly __checklyType = 'checks'

  constructor (logicalId: string, props: CheckProps) {
    super(Check.__checklyType, logicalId)
    Check.applyDefaultCheckConfig(props)
    // TODO: Throw an error if required properties are still missing after applying the defaults.
    this.name = props.name
    this.activated = props.activated
    this.muted = props.muted
    this.doubleCheck = props.doubleCheck
    this.shouldFail = props.shouldFail
    this.locations = props.locations
    this.privateLocations = props.privateLocations
    this.tags = props.tags
    this.frequency = props.frequency
    this.runtimeId = props.runtimeId
    this.environmentVariables = props.environmentVariables ?? []
    // Alert channel subscriptions will be synthesized separately in the Project construct.
    // This is due to the way things are organized on the BE.
    this.alertChannels = props.alertChannels ?? []
    this.groupId = props.groupId
    // alertSettings, useGlobalAlertSettings, groupId, groupOrder

    this.__checkFilePath = Session.checkFilePath
  }

  private static applyDefaultCheckConfig (props: CheckConfigDefaults) {
    if (!Session.checkDefaults) {
      return
    }
    let configKey: keyof CheckConfigDefaults
    for (configKey in Session.checkDefaults) {
      const newVal: any = props[configKey] ?? Session.checkDefaults[configKey]
      props[configKey] = newVal
    }
  }

  addSubscriptions () {
    if (!this.alertChannels) {
      return
    }
    for (const alertChannel of this.alertChannels) {
      const subscription = new AlertChannelSubscription(`check-alert-channel-subscription#${this.logicalId}#${alertChannel.logicalId}`, {
        alertChannelId: Ref.from(alertChannel.logicalId),
        checkId: Ref.from(this.logicalId),
        activated: true,
      })
    }
  }

  synthesize () {
    return {
      name: this.name,
      activated: this.activated,
      muted: this.muted,
      doubleCheck: this.doubleCheck,
      shouldFail: this.shouldFail,
      runtimeId: this.runtimeId,
      locations: this.locations,
      privateLocations: this.privateLocations,
      tags: this.tags,
      frequency: this.frequency,
      groupId: this.groupId,
      environmentVariables: this.environmentVariables,
      __checkFilePath: this.__checkFilePath,
      sourceFile: this.__checkFilePath,
    }
  }
}