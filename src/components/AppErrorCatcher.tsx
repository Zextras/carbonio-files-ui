/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react';

import { Catcher } from '@zextras/carbonio-design-system';

import { captureException } from '../utils/utils';

export const AppErrorCatcher: React.FC = ({ children }) => {
	const onError = useCallback((error) => {
		captureException(error);
	}, []);
	return <Catcher onError={onError}>{children}</Catcher>;
};
