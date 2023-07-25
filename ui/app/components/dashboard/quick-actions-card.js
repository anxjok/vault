/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

/**
 * @module DashboardQuickActionsCard
 * DashboardQuickActionsCard component allows users to see a list of secrets engines filtered by
 * kv, pki and database and perform certain actions based on the type of secret engine selected
 *
 * @example
 * ```js
 * <DashboardQuickActionsCard />
 * ```
 * @param {array}
 */

const getActionsByEngineType = (type) => {
  switch (type) {
    case 'kv':
      return [
        {
          actionTitle: 'Find KV secrets',
          actionType: 'find-kv',
          path: 'vault.cluster.secrets',
        },
      ];
    case 'database':
      return [
        {
          actionTitle: 'Generate credentials for database',
          actionType: 'generate-credentials-db',
          path: 'vault.cluster.database',
        },
      ];
    case 'pki':
      return [
        {
          actionTitle: 'Issue certificate',
          actionType: 'issue-certificate-pki',
          path: 'vault.cluster.pki',
        },
        {
          actionTitle: 'View certificate',
          actionType: 'view-certificate-pki',
          path: 'vault.cluster.pki',
        },
        {
          actionTitle: 'View issuer',
          actionType: 'view-issuer-pki',
          path: 'vault.cluster.pki',
        },
      ];
  }
};

const getActionParamByAction = (type) => {
  switch (type) {
    case 'find-kv':
      return {
        title: 'Secret Path',
        subText: 'Path of the secret you want to read, including the mount. E.g., secret/data/foo.',
        elementType: 'input',
        buttonText: 'Read secrets',
      };
    case 'generate-credentials-db':
      return { title: 'Role to use', elementType: 'select', buttonText: 'Generate credentials' };
    case 'issue-certificate-pki':
      return {
        title: 'Role to use',
        elementType: 'search-select',
        placeholder: 'Type to find a role...',
        buttonText: 'Issue leaf certificate',
        model: 'pki/role',
      };
    case 'view-certificate-pki':
      return {
        title: 'Certificate serial number',
        placeholder: '33:a3:...',
        elementType: 'search-select',
        buttonText: 'View certificate',
        model: 'pki/certificate/base',
      };
    case 'view-issuer-pki':
      return {
        title: 'Issuer',
        placeholder: 'Type issuer name or ID',
        elementType: 'search-select',
        buttonText: 'View issuer',
        model: 'pki/issuer',
        nameKey: 'issuerName',
      };
  }
};

export default class DashboardQuickActionsCard extends Component {
  @tracked selectedEngine;
  @tracked selectedActions = [];
  @tracked selectedAction;
  @tracked actionParamField;
  @tracked selectedEngineName;
  @tracked value;

  constructor() {
    super(...arguments);

    if (!this.selectedEngine) {
      this.selectedActions = getActionsByEngineType('kv');
      this.actionParamField = getActionParamByAction('find-kv');
    }
  }

  get filteredSecretEngines() {
    return this.args.secretsEngines.filter(
      (secretEngine) =>
        (secretEngine.shouldIncludeInList && secretEngine.type === 'pki') ||
        secretEngine.type === 'kv' ||
        secretEngine.type === 'database'
    );
  }

  get secretsEnginesOptions() {
    return this.filteredSecretEngines.map((filteredSecretEngine) => {
      const name = filteredSecretEngine.path.replace('/', '');

      return {
        name,
        id: `${filteredSecretEngine.type} ${name}`,
      };
    });
  }

  @action
  handleSearchEngineSelect([selectedSearchEngines]) {
    if (selectedSearchEngines?.length) {
      const selectedEngine = selectedSearchEngines.split(' ');
      this.selectedEngine = selectedEngine.firstObject;
      this.selectedEngineName = selectedEngine[1];
    }

    this.selectedActions = getActionsByEngineType(this.selectedEngine);
    this.setSelectedAction(this.selectedActions?.firstObject.actionType);
  }

  @action
  setSelectedAction(selectedAction) {
    this.selectedAction = selectedAction;
    this.actionParamField = getActionParamByAction(selectedAction);
  }

  @action
  handleIssuerSearch(val) {
    if (Array.isArray(val)) {
      this.value = val[0];
    } else {
      this.value = val;
    }
  }
}
