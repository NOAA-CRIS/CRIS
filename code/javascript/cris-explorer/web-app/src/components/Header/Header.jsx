// Framework and third-party non-ui

// Hooks, context, and constants
import { useTranslation } from 'react-i18next';
import { links } from '../../constants/AppConfig.json';
// App components

// Assets
import logo from '../../assets/logo.svg';

// Component specific modules (Component-styled, etc.)
import './Header.scss';

// Third-party components (buttons, icons, etc.)

export const Header = () => {
    const [t] = useTranslation();
    return (
        <header className="header">
            <div className="header__start">
                <img
                    className="header__logo"
                    src={logo}
                    alt={t('App.title')}
                    aria-label={t('App.header.crisDataExplorerLogo')}
                />
            </div>
            <div className="header__end">
                <nav className="header__nav">
                    <ul className="header__nav-list">
                        <li className="header__nav-item">
                            <a
                                href={links.data}
                                className="header__nav-link"
                                target="_blank"
                                aria-label={t('App.header.goToData')}
                            >
                                {t('App.header.data')}
                            </a>
                        </li>
                        <li className="header__nav-item">
                            <a
                                href={links.hub}
                                className="header__nav-link"
                                target="_blank"
                                aria-label={t('App.header.goToCrisHub')}
                            >
                                {t('App.header.crisHub')}
                            </a>
                        </li>
                        <li className="header__nav-item">
                            <a
                                href={links.help}
                                className="header__nav-link"
                                target="_blank"
                                aria-label={t('App.header.goToHelp')}
                            >
                                {t('App.header.help')}
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
