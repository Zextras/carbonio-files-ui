/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react';

import includes from 'lodash/includes';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { DISPLAYER_TABS } from '../carbonio-files-ui-common/constants';
import useQueryParam from '../carbonio-files-ui-common/hooks/useQueryParam';
import { URLParams } from '../carbonio-files-ui-common/types/common';
import { isSearchView } from '../carbonio-files-ui-common/utils/utils';
import { useNavigation } from './useNavigation';

export function useActiveNode(): {
	activeNodeId?: string;
	tab?: string;
	setActiveNode: (newId: string, newTab?: string) => void;
	removeActiveNode: () => void;
	isDetailsTab: boolean;
	isSharingTab: boolean;
	isVersioningTab: boolean;
	isExistingTab: boolean;
} {
	const { navigateTo } = useNavigation();

	// const paramsMap = Object.fromEntries(new URLSearchParams(location.search));
	const activeNodeId = useQueryParam('node');
	const tab = useQueryParam('tab');

	const { rootId, filter } = useParams<URLParams>();
	const folderId = useQueryParam('folder');
	const fileId = useQueryParam('file');
	const location = useLocation();
	const inSearchView = isSearchView(location);
	const history = useHistory();

	const setActiveNode = useCallback(
		(newId: string, newTab?: string) => {
			let queryParams = '?';
			if (folderId) {
				queryParams += `folder=${folderId}&`;
			} else if (fileId) {
				queryParams += `file=${fileId}&`;
			}
			queryParams += `node=${newId}`;

			if (newTab) {
				queryParams += `&tab=${newTab}`;
			}

			if (inSearchView) {
				const destination = `${history.location.pathname}${queryParams}`;
				history.replace(destination);
			} else {
				let params = '';
				if (rootId) {
					params += `root/${rootId}`;
				} else if (filter) {
					params += `filter/${filter}/`;
				}
				const destination = `/${params}${queryParams}`;
				navigateTo(destination, true);
			}
		},
		[fileId, filter, folderId, history, inSearchView, navigateTo, rootId]
	);

	const removeActiveNode = useCallback(() => {
		if (inSearchView) {
			const destination = `${history.location.pathname}`;
			history.replace(destination);
		} else {
			let params = '';
			if (rootId) {
				params += `root/${rootId}`;
			} else if (filter) {
				params += `filter/${filter}/`;
			}
			let queryParams = '?';
			if (folderId) {
				queryParams += `folder=${folderId}`;
			}
			const destination = `/${params}${queryParams}`;
			navigateTo(destination, true);
		}
	}, [filter, folderId, history, inSearchView, navigateTo, rootId]);

	return {
		activeNodeId,
		tab,
		setActiveNode,
		removeActiveNode,
		isDetailsTab: tab === DISPLAYER_TABS.details,
		isSharingTab: tab === DISPLAYER_TABS.sharing,
		isVersioningTab: tab === DISPLAYER_TABS.versioning,
		isExistingTab: includes(DISPLAYER_TABS, tab)
	};
}
