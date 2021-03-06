/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryChip, SearchViewProps } from '@zextras/carbonio-shell-ui';
import { graphql } from 'msw';

import { ROOTS } from '../carbonio-files-ui-common/constants';
import handleFindNodesRequest from '../carbonio-files-ui-common/mocks/handleFindNodesRequest';
import { populateNodePage, populateNodes } from '../carbonio-files-ui-common/mocks/mockUtils';
import {
	FindNodesQuery,
	FindNodesQueryVariables
} from '../carbonio-files-ui-common/types/graphql/types';
import { render } from '../carbonio-files-ui-common/utils/testUtils';
import { CreateOptionsContent } from '../hooks/useCreateOptions';
import server from '../mocks/server';
import SearchView from './SearchView';

jest.mock('../hooks/useCreateOptions', () => ({
	useCreateOptions: (): CreateOptionsContent => ({
		setCreateOptions: jest.fn(),
		removeCreateOptions: jest.fn()
	})
}));

const updateQueryMock = jest.fn();

const useQuery = jest.fn<
	ReturnType<SearchViewProps['useQuery']>,
	Parameters<SearchViewProps['useQuery']>
>(() => {
	const [query, setQuery] = useState<QueryChip[]>([]);
	const updateQuery = useCallback((chips: QueryChip[]) => {
		setQuery(chips);
		updateQueryMock(chips);
	}, []);

	return [query, updateQuery];
});

describe('Search view', () => {
	describe('Advanced search', () => {
		test('When user select flagged, flagged param is set', async () => {
			const ResultsHeader = (): JSX.Element => <p>Results header</p>;
			const useDisableSearch = jest.fn();
			const mockedFindNodes = jest.fn(handleFindNodesRequest);
			server.use(
				graphql.query<FindNodesQuery, FindNodesQueryVariables>('findNodes', mockedFindNodes)
			);
			render(
				<SearchView
					useQuery={useQuery}
					ResultsHeader={ResultsHeader}
					useDisableSearch={useDisableSearch}
				/>,
				{ initialRouterEntries: ['/search'] }
			);

			await screen.findByText(/No search executed/i);
			await screen.findByText(/view files and folders/i);
			expect(screen.getByText(/results header/i)).toBeVisible();
			expect(screen.getByRole('button', { name: /advanced filter/i })).toBeVisible();
			userEvent.click(screen.getByRole('button', { name: /advanced filter/i }));
			await screen.findByText(/^flagged/i);
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByRole('button', { name: /search/i });
			expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled', '');
			act(() => {
				userEvent.click(screen.getByText(/^flagged/i));
			});
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /search/i })).not.toHaveAttribute('disabled', '')
			);
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /search/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await waitFor(() => expect(updateQueryMock).toHaveBeenCalled());
			expect(updateQueryMock).toHaveBeenCalledWith([
				expect.objectContaining({
					value: true,
					avatarIcon: 'Flag',
					label: 'Flagged'
				})
			]);
			expect(mockedFindNodes).toHaveBeenCalledWith(
				expect.objectContaining({
					variables: expect.objectContaining({ flagged: true })
				}),
				expect.anything(),
				expect.anything()
			);
			expect(screen.getByRole('button', { name: /1 advanced filter/i })).toBeVisible();
			act(() => {
				// run timers of displayer
				jest.runOnlyPendingTimers();
			});
		});

		test('When user select shared, shared_by_me param is set', async () => {
			const ResultsHeader = (): JSX.Element => <p>Results header</p>;
			const useDisableSearch = jest.fn();
			const mockedFindNodes = jest.fn(handleFindNodesRequest);
			server.use(
				graphql.query<FindNodesQuery, FindNodesQueryVariables>('findNodes', mockedFindNodes)
			);
			render(
				<SearchView
					useQuery={useQuery}
					ResultsHeader={ResultsHeader}
					useDisableSearch={useDisableSearch}
				/>,
				{ initialRouterEntries: ['/search'] }
			);

			await screen.findByText(/No search executed/i);
			await screen.findByText(/view files and folders/i);
			expect(screen.getByText(/results header/i)).toBeVisible();
			expect(screen.getByRole('button', { name: /advanced filter/i })).toBeVisible();
			userEvent.click(screen.getByRole('button', { name: /advanced filter/i }));
			await screen.findByText(/^shared/i);
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByRole('button', { name: /search/i });
			expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled', '');
			act(() => {
				userEvent.click(screen.getByText(/^shared/i));
			});
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /search/i })).not.toHaveAttribute('disabled', '')
			);
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /search/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await waitFor(() => expect(updateQueryMock).toHaveBeenCalled());
			expect(updateQueryMock).toHaveBeenCalledWith([
				expect.objectContaining({
					value: true,
					avatarIcon: 'Share',
					label: 'Shared'
				})
			]);
			expect(mockedFindNodes).toHaveBeenCalledWith(
				expect.objectContaining({
					variables: expect.objectContaining({ shared_by_me: true })
				}),
				expect.anything(),
				expect.anything()
			);
			expect(screen.getByRole('button', { name: /1 advanced filter/i })).toBeVisible();
			act(() => {
				// run timers of displayer
				jest.runOnlyPendingTimers();
			});
		});

		test('When user choose a folder and the sub-folders param, folder_id and cascade are set', async () => {
			const ResultsHeader = (): JSX.Element => <p>Results header</p>;
			const useDisableSearch = jest.fn();
			const mockedFindNodes = jest.fn(handleFindNodesRequest);
			server.use(
				graphql.query<FindNodesQuery, FindNodesQueryVariables>('findNodes', mockedFindNodes)
			);
			render(
				<SearchView
					useQuery={useQuery}
					ResultsHeader={ResultsHeader}
					useDisableSearch={useDisableSearch}
				/>,
				{ initialRouterEntries: ['/search'] }
			);

			await screen.findByText(/No search executed/i);
			await screen.findByText(/view files and folders/i);
			expect(screen.getByText(/results header/i)).toBeVisible();
			expect(screen.getByRole('button', { name: /advanced filter/i })).toBeVisible();
			userEvent.click(screen.getByRole('button', { name: /advanced filter/i }));
			await screen.findByText(/select a folder/i);
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByRole('button', { name: /search/i });
			expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled', '');
			userEvent.click(screen.getByText(/select a folder/i));
			await screen.findByRole('button', { name: /choose folder/i });
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			expect(screen.getByText(/home/i)).toBeInTheDocument();
			expect(screen.getByText(/search also in contained folders/i)).toBeInTheDocument();
			expect(screen.getByTestId('icon: CheckmarkSquare')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /choose folder/i })).toHaveAttribute(
				'disabled',
				''
			);
			userEvent.click(screen.getByText(/home/i));
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /choose folder/i })).not.toHaveAttribute(
					'disabled',
					''
				)
			);
			act(() => {
				userEvent.click(screen.getByText(/search also in contained folders/i));
			});
			await screen.findByTestId('icon: Square');
			act(() => {
				userEvent.click(screen.getByText(/search also in contained folders/i));
			});
			await screen.findByTestId('icon: CheckmarkSquare');
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /choose folder/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByText(/home/i);
			expect(screen.getAllByTestId('icon: Close')).toHaveLength(2);
			expect(screen.getByRole('button', { name: /search/i })).not.toHaveAttribute('disabled', '');
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /search/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await waitFor(() => expect(updateQueryMock).toHaveBeenCalled());
			expect(updateQueryMock).toHaveBeenCalledWith([
				expect.objectContaining({
					value: ROOTS.LOCAL_ROOT,
					avatarIcon: 'Folder',
					label: 'under:Home'
				})
			]);
			expect(mockedFindNodes).toHaveBeenCalledWith(
				expect.objectContaining({
					variables: expect.objectContaining({ folder_id: ROOTS.LOCAL_ROOT, cascade: true })
				}),
				expect.anything(),
				expect.anything()
			);
			act(() => {
				// run timers of displayer
				jest.runOnlyPendingTimers();
			});
		});

		test('When user choose a folder but not the sub-folders param, folder_id is set with selected folder id and cascade is set to false', async () => {
			const ResultsHeader = (): JSX.Element => <p>Results header</p>;
			const useDisableSearch = jest.fn();
			const mockedFindNodes = jest.fn(handleFindNodesRequest);
			server.use(
				graphql.query<FindNodesQuery, FindNodesQueryVariables>('findNodes', mockedFindNodes)
			);
			render(
				<SearchView
					useQuery={useQuery}
					ResultsHeader={ResultsHeader}
					useDisableSearch={useDisableSearch}
				/>,
				{ initialRouterEntries: ['/search'] }
			);

			await screen.findByText(/No search executed/i);
			await screen.findByText(/view files and folders/i);
			expect(screen.getByText(/results header/i)).toBeVisible();
			expect(screen.getByRole('button', { name: /advanced filter/i })).toBeVisible();
			userEvent.click(screen.getByRole('button', { name: /advanced filter/i }));
			await screen.findByText(/select a folder/i);
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByRole('button', { name: /search/i });
			expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled', '');
			userEvent.click(screen.getByText(/select a folder/i));
			await screen.findByRole('button', { name: /choose folder/i });
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			expect(screen.getByText(/home/i)).toBeInTheDocument();
			expect(screen.getByText(/search also in contained folders/i)).toBeInTheDocument();
			expect(screen.getByTestId('icon: CheckmarkSquare')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /choose folder/i })).toHaveAttribute(
				'disabled',
				''
			);
			userEvent.click(screen.getByText(/home/i));
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /choose folder/i })).not.toHaveAttribute(
					'disabled',
					''
				)
			);
			act(() => {
				userEvent.click(screen.getByText(/search also in contained folders/i));
			});
			await screen.findByTestId('icon: Square');
			expect(screen.queryByTestId('icon: CheckmarkSquare')).not.toBeInTheDocument();
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /choose folder/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByText(/home/i);
			expect(screen.getAllByTestId('icon: Close')).toHaveLength(2);
			expect(screen.getByRole('button', { name: /search/i })).not.toHaveAttribute('disabled', '');
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /search/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await waitFor(() => expect(updateQueryMock).toHaveBeenCalled());
			expect(updateQueryMock).toHaveBeenCalledWith([
				expect.objectContaining({
					value: ROOTS.LOCAL_ROOT,
					avatarIcon: 'Folder',
					label: 'in:Home'
				})
			]);
			expect(mockedFindNodes).toHaveBeenCalledWith(
				expect.objectContaining({
					variables: expect.objectContaining({ folder_id: ROOTS.LOCAL_ROOT, cascade: false })
				}),
				expect.anything(),
				expect.anything()
			);
			act(() => {
				// run timers of displayer
				jest.runOnlyPendingTimers();
			});
		});

		test('When user types some keyword, keywords param is set with new keywords', async () => {
			const ResultsHeader = (): JSX.Element => <p>Results header</p>;
			const useDisableSearch = jest.fn();
			const mockedFindNodes = jest.fn(handleFindNodesRequest);
			server.use(
				graphql.query<FindNodesQuery, FindNodesQueryVariables>('findNodes', mockedFindNodes)
			);
			render(
				<SearchView
					useQuery={useQuery}
					ResultsHeader={ResultsHeader}
					useDisableSearch={useDisableSearch}
				/>,
				{ initialRouterEntries: ['/search'] }
			);

			await screen.findByText(/No search executed/i);
			await screen.findByText(/view files and folders/i);
			expect(screen.getByText(/results header/i)).toBeVisible();
			expect(screen.getByRole('button', { name: /advanced filter/i })).toBeVisible();
			userEvent.click(screen.getByRole('button', { name: /advanced filter/i }));
			await screen.findByText(/keywords/i);
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByRole('button', { name: /search/i });
			expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled', '');

			act(() => {
				userEvent.type(screen.getByText(/keywords/i), 'keyword1;');
			});
			// wait for chips to be created (1 chip + icon close of the modal)
			await waitFor(() => expect(screen.getAllByTestId('icon: Close')).toHaveLength(2));
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /search/i })).not.toHaveAttribute('disabled', '')
			);
			expect(screen.getByText(/keyword1/i)).toBeVisible();
			act(() => {
				userEvent.type(screen.getByText(/keywords/i), 'keyword2;');
			});
			// wait for chips to be created (2 chips + icon close of the modal)
			await waitFor(() => expect(screen.getAllByTestId('icon: Close')).toHaveLength(3));
			expect(screen.getByText(/keyword2/i)).toBeVisible();

			act(() => {
				userEvent.click(screen.getByRole('button', { name: /search/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await waitFor(() => expect(updateQueryMock).toHaveBeenCalled());
			expect(updateQueryMock).toHaveBeenCalledWith([
				expect.objectContaining({
					value: 'keyword1',
					hasAvatar: false,
					label: 'keyword1'
				}),
				expect.objectContaining({
					value: 'keyword2',
					hasAvatar: false,
					label: 'keyword2'
				})
			]);
			expect(mockedFindNodes).toHaveBeenCalledWith(
				expect.objectContaining({
					variables: expect.objectContaining({ keywords: ['keyword1', 'keyword2'] })
				}),
				expect.anything(),
				expect.anything()
			);
			expect(screen.getByRole('button', { name: /1 advanced filter/i })).toBeVisible();
			act(() => {
				// run timers of displayer
				jest.runOnlyPendingTimers();
			});
		});

		test('All advanced filters together', async () => {
			const ResultsHeader = (): JSX.Element => <p>Results header</p>;
			const useDisableSearch = jest.fn();
			const mockedFindNodes = jest.fn(handleFindNodesRequest);
			server.use(
				graphql.query<FindNodesQuery, FindNodesQueryVariables>('findNodes', mockedFindNodes)
			);
			render(
				<SearchView
					useQuery={useQuery}
					ResultsHeader={ResultsHeader}
					useDisableSearch={useDisableSearch}
				/>,
				{ initialRouterEntries: ['/search'] }
			);

			await screen.findByText(/No search executed/i);
			await screen.findByText(/view files and folders/i);
			expect(screen.getByText(/results header/i)).toBeVisible();
			expect(screen.getByRole('button', { name: /advanced filter/i })).toBeVisible();
			userEvent.click(screen.getByRole('button', { name: /advanced filter/i }));
			// keywords
			await screen.findByText(/keywords/i);
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByRole('button', { name: /search/i });
			expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled', '');

			act(() => {
				userEvent.type(screen.getByText(/keywords/i), 'keyword1;');
			});
			// wait for chips to be created (1 chip + icon close of the modal)
			await waitFor(() => expect(screen.getAllByTestId('icon: Close')).toHaveLength(2));
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /search/i })).not.toHaveAttribute('disabled', '')
			);
			expect(screen.getByText(/keyword1/i)).toBeVisible();
			act(() => {
				userEvent.type(screen.getByText(/keywords/i), 'keyword2;');
			});
			// wait for chips to be created (2 chips + icon close of the modal)
			await waitFor(() => expect(screen.getAllByTestId('icon: Close')).toHaveLength(3));
			expect(screen.getByText(/keyword2/i)).toBeVisible();
			// flagged
			act(() => {
				userEvent.click(screen.getByText(/^flagged/i));
			});
			// shared by me
			act(() => {
				userEvent.click(screen.getByText(/^shared/i));
			});
			// folder
			userEvent.click(screen.getByText(/select a folder/i));
			await screen.findByRole('button', { name: /choose folder/i });
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			expect(screen.getByText(/home/i)).toBeInTheDocument();
			expect(screen.getByText(/search also in contained folders/i)).toBeInTheDocument();
			expect(screen.getByTestId('icon: CheckmarkSquare')).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /choose folder/i })).toHaveAttribute(
				'disabled',
				''
			);
			userEvent.click(screen.getByText(/home/i));
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /choose folder/i })).not.toHaveAttribute(
					'disabled',
					''
				)
			);
			act(() => {
				userEvent.click(screen.getByText(/search also in contained folders/i));
			});
			await screen.findByTestId('icon: Square');
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /choose folder/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await screen.findByText(/home/i);
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /search/i }));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			await waitFor(() => expect(updateQueryMock).toHaveBeenCalled());
			expect(updateQueryMock).toHaveBeenCalledWith([
				expect.objectContaining({
					value: 'keyword1',
					hasAvatar: false,
					label: 'keyword1'
				}),
				expect.objectContaining({
					value: 'keyword2',
					hasAvatar: false,
					label: 'keyword2'
				}),
				expect.objectContaining({
					value: true,
					avatarIcon: 'Flag',
					label: 'Flagged'
				}),
				expect.objectContaining({
					value: true,
					avatarIcon: 'Share',
					label: 'Shared'
				}),
				expect.objectContaining({
					value: ROOTS.LOCAL_ROOT,
					avatarIcon: 'Folder',
					label: 'in:Home'
				})
			]);
			expect(mockedFindNodes).toHaveBeenCalledWith(
				expect.objectContaining({
					variables: expect.objectContaining({
						keywords: ['keyword1', 'keyword2'],
						flagged: true,
						shared_by_me: true,
						folder_id: ROOTS.LOCAL_ROOT,
						cascade: false
					})
				}),
				expect.anything(),
				expect.anything()
			);
			expect(screen.getByRole('button', { name: /4 advanced filter/i })).toBeVisible();
			act(() => {
				// run timers of displayer
				jest.runOnlyPendingTimers();
			});
		});

		test('search action run a search and results are shown in the list', async () => {
			const ResultsHeader = (): JSX.Element => <p>Results header</p>;
			const useDisableSearch = jest.fn();
			const nodes = populateNodes(10);
			server.use(
				graphql.query<FindNodesQuery, FindNodesQueryVariables>('findNodes', (req, res, ctx) =>
					res(
						ctx.data({
							findNodes: populateNodePage(nodes)
						})
					)
				)
			);
			render(
				<SearchView
					useQuery={useQuery}
					ResultsHeader={ResultsHeader}
					useDisableSearch={useDisableSearch}
				/>,
				{ initialRouterEntries: ['/search'] }
			);

			await screen.findByText(/No search executed/i);
			await screen.findByText(/view files and folders/i);
			expect(screen.getByText(/results header/i)).toBeVisible();
			expect(screen.getByRole('button', { name: /advanced filter/i })).toBeVisible();
			userEvent.click(screen.getByRole('button', { name: /advanced filter/i }));
			await screen.findByRole('button', { name: /search/i });
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled', '');
			act(() => {
				userEvent.click(screen.getByText(/^flagged/i));
			});
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /search/i })).not.toHaveAttribute('disabled', '')
			);
			act(() => {
				userEvent.click(screen.getByRole('button', { name: /search/i }));
			});
			await screen.findByText(nodes[0].name);
			expect(screen.getByText(nodes[0].name)).toBeVisible();
			expect(screen.getByText(nodes[nodes.length - 1].name)).toBeVisible();
			act(() => {
				// run timers of displayer
				jest.runOnlyPendingTimers();
			});
		});

		test('Close modal action does not run a search', async () => {
			const ResultsHeader = (): JSX.Element => <p>Results header</p>;
			const useDisableSearch = jest.fn();
			const mockedFindNodes = jest.fn(handleFindNodesRequest);
			server.use(
				graphql.query<FindNodesQuery, FindNodesQueryVariables>('findNodes', mockedFindNodes)
			);
			render(
				<SearchView
					useQuery={useQuery}
					ResultsHeader={ResultsHeader}
					useDisableSearch={useDisableSearch}
				/>,
				{ initialRouterEntries: ['/search'] }
			);

			await screen.findByText(/No search executed/i);
			await screen.findByText(/view files and folders/i);
			expect(screen.getByText(/results header/i)).toBeVisible();
			expect(screen.getByRole('button', { name: /advanced filter/i })).toBeVisible();
			userEvent.click(screen.getByRole('button', { name: /advanced filter/i }));
			await screen.findByRole('button', { name: /search/i });
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			expect(screen.getByRole('button', { name: /search/i })).toHaveAttribute('disabled', '');
			act(() => {
				userEvent.click(screen.getByText(/^flagged/i));
			});
			await waitFor(() =>
				expect(screen.getByRole('button', { name: /search/i })).not.toHaveAttribute('disabled', '')
			);
			act(() => {
				userEvent.click(screen.getByTestId('icon: Close'));
			});
			act(() => {
				// run timers of modal
				jest.runOnlyPendingTimers();
			});
			expect(screen.queryByRole('button', { name: /search/i })).not.toBeInTheDocument();
			expect(mockedFindNodes).not.toHaveBeenCalled();
			expect(screen.getByText(/no search executed/i)).toBeVisible();
		});
	});
});
