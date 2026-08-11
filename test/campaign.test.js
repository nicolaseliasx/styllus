import test from 'node:test';
import assert from 'node:assert/strict';

import { getCampaignState } from '../src/campaign.js';

test('mantém a pré-reinauguração antes da meia-noite de 15/08 em Brasília', () => {
  assert.equal(getCampaignState(new Date('2026-08-15T02:59:59.999Z')), 'prelaunch');
});

test('ativa a nova fase exatamente à meia-noite de 15/08 em Brasília', () => {
  assert.equal(getCampaignState(new Date('2026-08-15T03:00:00.000Z')), 'launched');
});

test('mantém o estado lançado depois da data de corte', () => {
  assert.equal(getCampaignState(new Date('2027-01-01T00:00:00.000Z')), 'launched');
});
