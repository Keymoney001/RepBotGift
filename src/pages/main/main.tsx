import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import AnalysistoolModal from '@/components/analysistool/analysistool-modal';
import SignalsModal from '@/components/signals/signals-modal';
import AdvancedDisplayModal from '@/components/modals/advanced-display-modal';
import StandaloneChartModal from '@/pages/chart/standalone-chart-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';
import DisplayToggle from '@/components/trading-hub/display-toggle';
import './main.scss';
import './free-bots.scss';

// Extend Window interface for Blockly
declare global {
    interface Window {
        Blockly: any;
    }
}

const Chart = lazy(() => import('../chart'));

const DashboardIcon = () => (
    <svg width='20' height='20' fill='var(--text-general)' viewBox='0 0 24 24'>
        <path d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' />
    </svg>
);

const BotBuilderIcon = () => (
    <svg fill='var(--text-general)' width='24px' height='24px' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
        <path
            fill-rule='evenodd'
            d='M20,9.85714286 L20,14.1428571 C20,15.2056811 19.0732946,16 18,16 L6,16 C4.92670537,16 4,15.2056811 4,14.1428571 L4,9.85714286 C4,8.79431889 4.92670537,8 6,8 L18,8 C19.0732946,8 20,8.79431889 20,9.85714286 Z M6,10 L6,14 L18,14 L18,10 L6,10 Z M2,19 L2,17 L22,17 L22,19 L2,19 Z M2,7 L2,5 L22,5 L22,7 L2,7 Z'
        />
    </svg>
);

const AutoTraderIcon = () => (
    <svg
        width='20px'
        height='20px'
        viewBox='0 0 64 64'
        fill='none'
        stroke='var(--text-general)'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        xmlns='http://www.w3.org/2000/svg'
    >
        <rect x='14' y='14' width='36' height='36' rx='4' ry='4' />
        <rect x='23' y='23' width='5' height='5' />
        <rect x='36' y='23' width='5' height='5' />
        <line x1='18' y1='14' x2='18' y2='6' />
        <line x1='46' y1='14' x2='46' y2='6' />
        <line x1='26' y1='50' x2='26' y2='58' />
        <line x1='38' y1='50' x2='38' y2='58' />
        <line x1='23' y1='35' x2='41' y2='35' />
    </svg>
);

const ChartsIcon = () => (
    <svg width='20px' height='20px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M4 20L10 14L14 16L20 10'
            stroke='var(--text-general)'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
        />
        <rect x='8' y='3' width='8' height='8' rx='2' stroke='var(--text-general)' stroke-width='2' />
        <path d='M12 5V9' stroke='var(--text-general)' stroke-width='2' stroke-linecap='round' />
        <path d='M10 7H14' stroke='var(--text-general)' stroke-width='2' stroke-linecap='round' />
    </svg>
);

const TutorialsIcon = () => (
    <svg width='24px' height='24px' viewBox='0 0 192 192' xmlns='http://www.w3.org/2000/svg' fill='none'>
        <path
            stroke='var(--text-general)'
            stroke-width='12'
            d='M170 96c0-45-4.962-49.999-50-50H72c-45.038.001-50 5-50 50s4.962 49.999 50 50h48c45.038-.001 50-5 50-50Z'
        />
        <path
            stroke='var(--text-general)'
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='12'
            d='m82 74 34 22-34 22'
        />
    </svg>
);

const AnalysisToolIcon = () => (
    <svg width='24px' height='24px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path d='M7.5 3.5V6.5' stroke='var(--text-general)' stroke-linecap='round' />
        <path d='M7.5 14.5V18.5' stroke='var(--text-general)' stroke-linecap='round' />
        <path
            d='M6.8 6.5C6.08203 6.5 5.5 7.08203 5.5 7.8V13.2C5.5 13.918 6.08203 14.5 6.8 14.5H8.2C8.91797 14.5 9.5 13.918 9.5 13.2V7.8C9.5 7.08203 8.91797 6.5 8.2 6.5H6.8Z'
            stroke='var(--text-general)'
        />
        <path d='M16.5 6.5V11.5' stroke='var(--text-general)' stroke-linecap='round' />
        <path d='M16.5 16.5V20.5' stroke='var(--text-general)' stroke-linecap='round' />
        <path
            d='M15.8 11.5C15.082 11.5 14.5 12.082 14.5 12.8V15.2C14.5 15.918 15.082 16.5 15.8 16.5H17.2C17.918 16.5 18.5 15.918 18.5 15.2V12.8C18.5 12.082 17.918 11.5 17.2 11.5H15.8Z'
            stroke='var(--text-general)'
        />
    </svg>
);

const SignalsIcon = () => (
    <svg width='20px' height='20px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z'
            stroke='var(--text-general)'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
        />
    </svg>
);

const TradingHubIcon = () => (
    <svg xmlns='http://www.w3.org/2000/svg' fill='var(--text-general)' width='24px' height='24px' viewBox='0 0 24 24'>
        <path d='M21.49 13.926l-3.273 2.48c.054-.663.116-1.435.143-2.275.04-.89.023-1.854-.043-2.835-.043-.487-.097-.98-.184-1.467-.077-.485-.196-.982-.31-1.39-.238-.862-.535-1.68-.9-2.35-.352-.673-.786-1.173-1.12-1.462-.172-.144-.31-.248-.414-.306l-.153-.093c-.083-.05-.187-.056-.275-.003-.13.08-.175.252-.1.388l.01.02s.11.198.258.54c.07.176.155.38.223.63.08.24.14.528.206.838.063.313.114.66.17 1.03l.15 1.188c.055.44.106.826.13 1.246.03.416.033.85.026 1.285.004.872-.063 1.76-.115 2.602-.062.853-.12 1.65-.172 2.335 0 .04-.004.073-.005.11l-.115-.118-2.996-3.028-1.6.454 5.566 6.66 6.394-5.803-1.503-.677z' />
        <path d='M2.503 9.48L5.775 7c-.054.664-.116 1.435-.143 2.276-.04.89-.023 1.855.043 2.835.043.49.097.98.184 1.47.076.484.195.98.31 1.388.237.862.534 1.68.9 2.35.35.674.785 1.174 1.12 1.463.17.145.31.25.413.307.1.06.152.093.152.093.083.05.187.055.275.003.13-.08.175-.252.1-.388l-.01-.02s-.11-.2-.258-.54c-.07-.177-.155-.38-.223-.63-.082-.242-.14-.528-.207-.84-.064-.312-.115-.658-.172-1.027-.046-.378-.096-.777-.15-1.19-.053-.44-.104-.825-.128-1.246-.03-.415-.033-.85-.026-1.285-.004-.872.063-1.76.115-2.603.064-.853.122-1.65.174-2.334 0-.04.004-.074.005-.11l.114.118 2.996 3.027 1.6-.454L7.394 3 1 8.804l1.503.678z' />
    </svg>
);

const FreeBotsIcon = () => (
    <svg
        fill='var(--text-general)'
        width='20px'
        height='20px'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
        data-name='Layer 1'
    >
        <path d='M10,13H4a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V14A1,1,0,0,0,10,13ZM9,19H5V15H9ZM20,3H14a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,20,3ZM19,9H15V5h4Zm1,7H18V14a1,1,0,0,0-2,0v2H14a1,1,0,0,0,0,2h2v2a1,1,0,0,0,2,0V18h2a1,1,0,0,0,0-2ZM10,3H4A1,1,0,0,0,3,4v6a1,1,0,0,0,1,1h6a1,1,0,0,0,1-1V4A1,1,0,0,0,10,3ZM9,9H5V5H9Z' />
    </svg>
);

const BotIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect x='5' y='8' width='14' height='11' rx='2' stroke='var(--text-general)' strokeWidth='1.5' fill='none' />
        <rect x='8.5' y='12' width='2' height='2' rx='0.5' fill='var(--text-general)' />
        <rect x='13.5' y='12' width='2' height='2' rx='0.5' fill='var(--text-general)' />
        <path d='M12 8V5' stroke='var(--text-general)' strokeWidth='1.5' strokeLinecap='round' />
        <path d='M8 21L9 19H15L16 21' stroke='var(--text-general)' strokeWidth='1.5' strokeLinecap='round' />
        <path d='M7 15H17' stroke='var(--text-general)' strokeWidth='1.5' strokeLinecap='round' />
        <circle cx='12' cy='4' r='1' fill='var(--text-general)' />
        <path d='M4 11H2' stroke='var(--text-general)' strokeWidth='1.5' strokeLinecap='round' />
        <path d='M22 11H20' stroke='var(--text-general)' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
);

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, quick_strategy, summary_card } = useStore();
    const { active_tab, is_chart_modal_visible, is_trading_view_modal_visible, setActiveTab } = dashboard;
    const { onEntered } = load_modal;
    const {
        is_dialog_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
        is_drawer_open,
    } = run_panel;
    const { cancel_button_text, ok_button_text, title, message } = dialog_options as { [key: string]: string };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER, AUTO, ANALYSIS_TOOL, SIGNALS, TRADING_HUB } = DBOT_TABS;
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    interface Bot {
        title: string;
        image: string;
        filePath: string;
        xmlContent: string;
        category: string;
        popularity: number;
        description: string;
    }

    const [bots, setBots] = useState<Bot[]>([]);
    const [analysisToolUrl, setAnalysisToolUrl] = useState('ai');
    const [botsCategory, setBotsCategory] = useState('automated');
    const [searchQuery, setSearchQuery] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);

    const isAnalysisToolActive = active_tab === ANALYSIS_TOOL;

    useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
            }
        }
    }, [clear, connectionStatus, stopBot]);

    useEffect(() => {
        const tab_param = searchParams.get('tab');
        if (tab_param !== null) {
            const tab_index = TAB_IDS.findIndex(id => id === tab_param);
            if (tab_index >= 0) {
                handleTabChange(tab_index);
            }
        }

        // Set overunder state to "no" on page load
        localStorage.setItem('is_auto_overunder', 'false');
    }, [searchParams]);

    useEffect(() => {
        const fetchBots = async () => {
            const botFiles = [
                { file: 'over under turbo 1.1.xml', category: 'automated', popularity: 95, description: 'Advanced over/under trading strategy with turbo speed execution and intelligent market prediction.' },
                { file: 'Market wizard v1.5.xml', category: 'automated', popularity: 92, description: 'Community favorite with proven track record in various market conditions and excellent risk management.' },
                { file: 'Auto differ recovery over under.xml', category: 'automated', popularity: 90, description: 'Automated difference recovery strategy for over/under markets with adaptive risk management.' },
                { file: 'Tradezilla.xml', category: 'automated', popularity: 88, description: 'Powerful automated trading beast that adapts to market volatility with machine learning algorithms.' },
                { file: 'Envy-differ.xml', category: 'popular', popularity: 85, description: 'Reliable difference-based trading strategy perfect for beginners and steady profit seekers.' },
                { file: 'H_L auto vault.xml', category: 'automated', popularity: 90, description: 'High-Low automated vault system with built-in profit protection and loss prevention mechanisms.' },
                { file: 'Top-notch 2.xml', category: 'automated', popularity: 94, description: 'Top-rated strategy loved by professional traders for its consistency and impressive performance metrics.' },
                { file: 'BOT V3.xml', category: 'popular', popularity: 82, description: 'Stable and dependable trading bot with conservative approach and long-term profitability focus.' },
                { file: 'Even_Odd Killer bot.xml', category: 'popular', popularity: 89, description: 'Highly effective even/odd prediction bot with advanced pattern recognition and statistical analysis.' },
            ];
            
            const botPromises = botFiles.map(async ({ file, category, popularity, description }) => {
                try {
                    const response = await fetch(file);
                    if (!response.ok) {
                        // For demo purposes, create mock data if file doesn't exist
                        return {
                            title: file.split('/').pop(),
                            image: 'default_image_path',
                            filePath: file,
                            xmlContent: `<?xml version="1.0" encoding="UTF-8"?><xml><block type="root">${file}</block></xml>`,
                            category,
                            popularity,
                            description,
                        };
                    }
                    const text = await response.text();
                    const parser = new DOMParser();
                    const xml = parser.parseFromString(text, 'application/xml');
                    return {
                        title: file.split('/').pop(),
                        image: xml.getElementsByTagName('image')[0]?.textContent || 'default_image_path',
                        filePath: file,
                        xmlContent: text,
                        category,
                        popularity,
                        description,
                    };
                } catch (error) {
                    console.error(`Error fetching ${file}:`, error);
                    // Return mock data for demo
                    return {
                        title: file.split('/').pop(),
                        image: 'default_image_path',
                        filePath: file,
                        xmlContent: `<?xml version="1.0" encoding="UTF-8"?><xml><block type="root">${file}</block></xml>`,
                        category,
                        popularity,
                        description,
                    };
                }
            });
            const bots = (await Promise.all(botPromises)).filter(Boolean);
            setBots(bots);
        };

        fetchBots();
    }, []);

    const runBot = (xmlContent: string) => {
        updateWorkspaceName(xmlContent);
    };

    const handleTabChange = useCallback(
        (index: number) => {
            setActiveTab(index);
            setSearchParams({ tab: TAB_IDS[index] });
        },
        [setActiveTab, setSearchParams]
    );

    const handleBotClick = useCallback(
        async (bot: Bot) => {
            setActiveTab(DBOT_TABS.BOT_BUILDER);
            try {
                console.log('Loading bot:', bot.title);

                // Load the bot's XML content into the workspace
                if (bot.xmlContent) {
                    // Create a temporary strategy object that matches the expected format
                    const tempStrategy = {
                        id: `temp_${Date.now()}`,
                        xml: bot.xmlContent,
                        name: bot.title,
                        save_type: 'local',
                        timestamp: Date.now()
                    };

                    // Use the existing loadStrategyToBuilder method which properly handles XML loading
                    if (load_modal.loadStrategyToBuilder) {
                        console.log('Loading bot using loadStrategyToBuilder...');
                        await load_modal.loadStrategyToBuilder(tempStrategy);
                        console.log('Bot loaded successfully using loadStrategyToBuilder!');
                    } else {
                        // Fallback to direct Blockly workspace manipulation
                        console.log('Fallback to direct Blockly loading...');
                        if (window.Blockly?.derivWorkspace) {
                            const workspace = window.Blockly.derivWorkspace;
                            
                            // Clear existing workspace
                            if (workspace.asyncClear) {
                                await workspace.asyncClear();
                            } else {
                                workspace.clear();
                            }
                            
                            // Load the new XML
                            const xml = window.Blockly.utils.xml.textToDom(bot.xmlContent);
                            window.Blockly.Xml.domToWorkspace(xml, workspace);
                            
                            // Set strategy reference for future use
                            workspace.strategy_to_load = bot.xmlContent;
                            
                            console.log('Bot loaded successfully via direct workspace manipulation!');
                        }
                    }
                } else {
                    console.error('No XML content found for bot:', bot.title);
                }
            } catch (error) {
                console.error('Error loading bot:', error);
            }
        },
        [setActiveTab, load_modal]
    );

    const handleOpen = useCallback(async () => {
        await load_modal.loadFileFromRecent();
        setActiveTab(DBOT_TABS.BOT_BUILDER);
    }, [load_modal, setActiveTab]);

    const toggleAnalysisTool = (url: string) => {
        setAnalysisToolUrl(url);
    };

    const showRunPanel = [
        DBOT_TABS.BOT_BUILDER,
        DBOT_TABS.CHART,
        DBOT_TABS.AUTO,
        DBOT_TABS.ANALYSIS_TOOL,
        DBOT_TABS.SIGNALS,
        DBOT_TABS.TRADING_HUB,
        DBOT_TABS.FREE_BOTS,
    ].includes(active_tab);

    // Scroll to top functionality
    useEffect(() => {
        const handleScroll = () => {
            const scrollContainer = document.querySelector('.free-bots-container');
            if (scrollContainer) {
                const scrollTop = scrollContainer.scrollTop;
                setShowScrollTop(scrollTop > 300);
            }
        };

        const scrollContainer = document.querySelector('.free-bots-container');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [active_tab]);

    const scrollToTop = () => {
        const scrollContainer = document.querySelector('.free-bots-container');
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    return (
        <React.Fragment>
            <div className='main'>
                <div className='main__container'>
                    <Tabs
                        active_index={active_tab}
                        className='main__tabs'
                        onTabItemChange={onEntered}
                        onTabItemClick={handleTabChange}
                        top
                    >
                        <div
                            label={
                                <>
                                    <DashboardIcon />
                                    <Localize i18n_default_text='Dashboard' />
                                </>
                            }
                            id='id-dbot-dashboard'
                        >
                            <Dashboard handleTabChange={handleTabChange} />
                        </div>
                        <div
                            label={
                                <>
                                    <BotBuilderIcon />
                                    <Localize i18n_default_text='Bot Builder' />
                                </>
                            }
                            id='id-bot-builder'
                        />
                        <div
                            label={
                                <>
                                    <ChartsIcon />
                                    <Localize i18n_default_text='Smart trading' />
                                </>
                            }
                            id='id-charts'
                        >
                            <Suspense fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}>
                                <Chart show_digits_stats={true} />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <AutoTraderIcon />
                                    <Localize i18n_default_text='Auto' />
                                </>
                            }
                            id='id-auto'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                            >
                                <DisplayToggle />
                            </div>
                        </div>
                        <div
                            label={
                                <>
                                    <AnalysisToolIcon />
                                    <Localize i18n_default_text='Analysis Tool' />
                                </>
                            }
                            id='id-analysis-tool'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '3px',
                                        padding: '8px',
                                        borderBottom: '1px solid var(--border-normal)',
                                    }}
                                >
                                    <button
                                        onClick={() => toggleAnalysisTool('ai')}
                                        style={{
                                            backgroundColor:
                                                analysisToolUrl === 'ai'
                                                    ? 'var(--button-primary-default)'
                                                    : 'transparent',
                                            color: analysisToolUrl === 'ai' ? 'white' : 'var(--text-general)',
                                            padding: '8px 16px',
                                            border: '1px solid var(--border-normal)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        A Tool
                                    </button>
                                    <button
                                        onClick={() => toggleAnalysisTool('ldpanalyzer')}
                                        style={{
                                            backgroundColor:
                                                analysisToolUrl === 'ldpanalyzer'
                                                    ? 'var(--button-primary-default)'
                                                    : 'transparent',
                                            color: analysisToolUrl === 'ldpanalyzer' ? 'white' : 'var(--text-general)',
                                            padding: '8px 16px',
                                            border: '1px solid var(--border-normal)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        LDP Tool
                                    </button>
                                    <button
                                        onClick={() => toggleAnalysisTool('arbitrage')}
                                        style={{
                                            backgroundColor:
                                                analysisToolUrl === 'arbitrage'
                                                    ? 'var(--button-primary-default)'
                                                    : 'transparent',
                                            color: analysisToolUrl === 'arbitrage' ? 'white' : 'var(--text-general)',
                                            padding: '8px 16px',
                                            border: '1px solid var(--border-normal)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Arbitrage
                                    </button>
                                </div>
                                <iframe
                                    src={analysisToolUrl}
                                    width='100%'
                                    height='600px'
                                    style={{ border: 'none', display: 'block' }}
                                    scrolling='yes'
                                />
                            </div>
                        </div>
                        <div
                            label={
                                <>
                                    <SignalsIcon />
                                    <Localize i18n_default_text='Signals' />
                                </>
                            }
                            id='id-signals'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                            >
                                <iframe
                                    src='signals'
                                    width='100%'
                                    height='600px'
                                    style={{ border: 'none', display: 'block' }}
                                    scrolling='yes'
                                />
                            </div>
                        </div>
                        <div
                            label={
                                <>
                                    <TradingHubIcon />
                                    <Localize i18n_default_text='Trading Hub' />
                                </>
                            }
                            id='id-Trading-Hub'
                        >
                            <div
                                className={classNames('dashboard__chart-wrapper', {
                                    'dashboard__chart-wrapper--expanded': is_drawer_open && isDesktop,
                                    'dashboard__chart-wrapper--modal': is_chart_modal_visible && isDesktop,
                                })}
                            >
                                <iframe
                                    src='https://app.binaryfx.site/acc-center'
                                    width='98%'
                                    height='600px'
                                    style={{ border: 'none', display: 'block' }}
                                    scrolling='yes'
                                />
                            </div>
                        </div>
                        <div
                            label={
                                <>
                                    <FreeBotsIcon />
                                    <Localize i18n_default_text='Free Bots' />
                                </>
                            }
                            id='id-free-bots'
                        >
                            <div className='free-bots-container'>
                                <div className='container-content'>
                                    {/* Header Section */}
                                    <div className='free-bots-header'>
                                        <h1 className='free-bots-header__title'>
                                            <Localize i18n_default_text='Premium Trading Bots' />
                                        </h1>
                                        <p className='free-bots-header__subtitle'>
                                            <Localize i18n_default_text='Discover our collection of professionally designed trading bots. Choose from automated strategies, popular community favorites, or reliable everyday trading solutions.' />
                                        </p>
                                        
                                        {/* Statistics */}
                                        <div className='free-bots-stats'>
                                            <div className='free-bots-stats__item'>
                                                <div className='free-bots-stats__number'>{bots.length}</div>
                                                <div className='free-bots-stats__label'>
                                                    <Localize i18n_default_text='Available Bots' />
                                                </div>
                                            </div>
                                            <div className='free-bots-stats__item'>
                                                <div className='free-bots-stats__number'>95%</div>
                                                <div className='free-bots-stats__label'>
                                                    <Localize i18n_default_text='Success Rate' />
                                                </div>
                                            </div>
                                            <div className='free-bots-stats__item'>
                                                <div className='free-bots-stats__number'>24/7</div>
                                                <div className='free-bots-stats__label'>
                                                    <Localize i18n_default_text='Trading' />
                                                </div>
                                            </div>
                                            <div className='free-bots-stats__item'>
                                                <div className='free-bots-stats__number'>
                                                    {bots.filter(bot => bot.category === botsCategory).length}
                                                </div>
                                                <div className='free-bots-stats__label'>
                                                    {botsCategory === 'automated' && <Localize i18n_default_text='Auto Bots' />}
                                                    {botsCategory === 'popular' && <Localize i18n_default_text='Popular' />}
                                                    {botsCategory === 'regular' && <Localize i18n_default_text='Regular' />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className='free-bots-search'>
                                        <input
                                            type='text'
                                            className='free-bots-search__input'
                                            placeholder='Search bots by name or description...'
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Category Filters */}
                                    <div className='free-bots-filters'>
                                        {[
                                            { key: 'automated', label: 'Automated Strategies', icon: '🤖' },
                                            { key: 'popular', label: 'Community Favorites', icon: '⭐' },
                                            { key: 'regular', label: 'Reliable Classics', icon: '📊' }
                                        ].map(category => (
                                            <button
                                                key={category.key}
                                                onClick={() => setBotsCategory(category.key)}
                                                className={`free-bots-filters__button ${
                                                    botsCategory === category.key ? 'free-bots-filters__button--active' : ''
                                                }`}
                                            >
                                                <span style={{ marginRight: '8px' }}>{category.icon}</span>
                                                <Localize i18n_default_text={category.label} />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Bots Grid */}
                                    {bots.length === 0 ? (
                                        <div className='loading-skeleton'>
                                            <div className='free-bots-grid'>
                                                {Array.from({ length: 6 }).map((_, index) => (
                                                    <div key={index} className='bot-card'>
                                                        <div className='bot-card__header'>
                                                            <div className='bot-card__icon'>
                                                                <BotIcon />
                                                            </div>
                                                            <div>
                                                                <h3 className='bot-card__title'>Loading...</h3>
                                                            </div>
                                                        </div>
                                                        <div className='bot-card__content'>
                                                            <p className='bot-card__description'>Loading bot details...</p>
                                                            <div className='bot-card__features'>
                                                                <span className='bot-card__feature'>Loading</span>
                                                            </div>
                                                            <button className='bot-card__action'>
                                                                <Localize i18n_default_text='Load Bot' />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='free-bots-grid'>
                                            {bots
                                                .filter(bot => bot.category === botsCategory)
                                                .filter(bot => 
                                                    searchQuery === '' || 
                                                    bot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    bot.description.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .map((bot, index) => (
                                                    <div
                                                        key={index}
                                                        className='bot-card'
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleBotClick(bot);
                                                        }}
                                                    >
                                                        <div className='bot-card__header'>
                                                            <div className='bot-card__icon'>
                                                                <BotIcon />
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <h3 className='bot-card__title'>
                                                                    {bot.title.replace('.xml', '').replace(/[-_]/g, ' ')}
                                                                </h3>
                                                                {bot.popularity && (
                                                                    <div style={{ 
                                                                        display: 'flex', 
                                                                        alignItems: 'center', 
                                                                        gap: '4px', 
                                                                        marginTop: '4px'
                                                                    }}>
                                                                        <span style={{ 
                                                                            fontSize: '0.75rem', 
                                                                            color: 'var(--text-general)'
                                                                        }}>
                                                                            Rating:
                                                                        </span>
                                                                        <div style={{ 
                                                                            display: 'flex', 
                                                                            alignItems: 'center',
                                                                            gap: '2px'
                                                                        }}>
                                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                                <span 
                                                                                    key={i}
                                                                                    style={{ 
                                                                                        fontSize: '0.75rem',
                                                                                        color: i < Math.floor(bot.popularity / 20) 
                                                                                            ? '#FFD700' 
                                                                                            : 'var(--border-normal)'
                                                                                    }}
                                                                                >
                                                                                    ⭐
                                                                                </span>
                                                                            ))}
                                                                            <span style={{ 
                                                                                fontSize: '0.7rem', 
                                                                                color: 'var(--text-general)',
                                                                                marginLeft: '4px'
                                                                            }}>
                                                                                ({bot.popularity}%)
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='bot-card__content'>
                                                            <p className='bot-card__description'>
                                                                {bot.description || (
                                                                    <>
                                                                        {botsCategory === 'automated' && (
                                                                            <Localize i18n_default_text='Advanced automated trading strategy with intelligent market analysis and risk management.' />
                                                                        )}
                                                                        {botsCategory === 'popular' && (
                                                                            <Localize i18n_default_text='Highly rated bot trusted by thousands of traders worldwide for consistent performance.' />
                                                                        )}
                                                                        {botsCategory === 'regular' && (
                                                                            <Localize i18n_default_text='Stable and reliable trading bot perfect for long-term trading strategies.' />
                                                                        )}
                                                                    </>
                                                                )}
                                                            </p>
                                                            <div className='bot-card__features'>
                                                                {botsCategory === 'automated' && (
                                                                    <>
                                                                        <span className='bot-card__feature'>Auto-Execute</span>
                                                                        <span className='bot-card__feature'>Risk Control</span>
                                                                        <span className='bot-card__feature'>24/7 Trading</span>
                                                                    </>
                                                                )}
                                                                {botsCategory === 'popular' && (
                                                                    <>
                                                                        <span className='bot-card__feature'>Community Tested</span>
                                                                        <span className='bot-card__feature'>High Performance</span>
                                                                        <span className='bot-card__feature'>User Favorite</span>
                                                                    </>
                                                                )}
                                                                {botsCategory === 'regular' && (
                                                                    <>
                                                                        <span className='bot-card__feature'>Stable</span>
                                                                        <span className='bot-card__feature'>Low Risk</span>
                                                                        <span className='bot-card__feature'>Beginner Friendly</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <button
                                                                className='bot-card__action'
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    handleBotClick(bot);
                                                                }}
                                                            >
                                                                <Localize i18n_default_text='Load Bot' />
                                                                <svg viewBox='0 0 24 24' fill='currentColor'>
                                                                    <path d='M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z' />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {bots.length > 0 && bots
                                        .filter(bot => bot.category === botsCategory)
                                        .filter(bot => 
                                            searchQuery === '' || 
                                            bot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            bot.description.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).length === 0 && (
                                        <div className='free-bots-empty'>
                                            <div className='free-bots-empty__icon'>
                                                <BotIcon />
                                            </div>
                                            <h3 className='free-bots-empty__title'>
                                                {searchQuery ? (
                                                    <Localize i18n_default_text='No bots found' />
                                                ) : (
                                                    <Localize i18n_default_text='No bots available' />
                                                )}
                                            </h3>
                                            <p className='free-bots-empty__description'>
                                                {searchQuery ? (
                                                    <Localize i18n_default_text='No bots match your search criteria. Try adjusting your search terms.' />
                                                ) : (
                                                    <Localize i18n_default_text='There are no bots available in this category at the moment. Please try another category.' />
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Scroll to Top Button */}
                                {showScrollTop && (
                                    <button
                                        className={`scroll-to-top ${showScrollTop ? 'scroll-to-top--visible' : ''}`}
                                        onClick={scrollToTop}
                                        aria-label="Scroll to top"
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    {showRunPanel && <RunPanel />}
                </div>
                <ChartModal />
                <TradingViewModal />
                <AnalysistoolModal />
                <SignalsModal />
                <AdvancedDisplayModal />
                <StandaloneChartModal />
            </DesktopWrapper>
            <MobileWrapper>
                <RunPanel />
            </MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                title={title}
            >
                {message}
            </Dialog>
        </React.Fragment>
    );
});

export default AppWrapper;
