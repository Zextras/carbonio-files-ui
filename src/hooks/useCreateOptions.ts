/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import {
	ACTION_TYPES,
	ActionFactory,
	registerActions,
	removeActions
} from '@zextras/carbonio-shell-ui';

type CreateOption = {
	id: string;
	action: ActionFactory<unknown>;
	type: typeof ACTION_TYPES.NEW;
};

export type CreateOptionsContent = {
	createOptions?: Array<CreateOption>;
	setCreateOptions: (appCreateOptions: Array<CreateOption>) => void;
	removeCreateOptions: (ids: Array<string>) => void;
};

export const useCreateOptions = (): {
	setCreateOptions: (...options: Array<CreateOption>) => void;
	removeCreateOptions: (...ids: Array<string>) => void;
} => {
	const setCreateOptionsCallback = useCallback((...options: Array<CreateOption>) => {
		registerActions(...options);
	}, []);

	const removeCreateOptionsCallback = useCallback((...ids: Array<string>) => {
		removeActions(...ids);
	}, []);

	return {
		setCreateOptions: setCreateOptionsCallback,
		removeCreateOptions: removeCreateOptionsCallback
	};
};
