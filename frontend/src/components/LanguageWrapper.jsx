import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import PropTypes from 'prop-types';

const LanguageWrapper = ({ children }) => {
    const { i18n } = useTranslation();
    
    useEffect(() => {
      const storedLanguage = localStorage.getItem('language');

      if (storedLanguage) {
        i18n.changeLanguage(storedLanguage);
      }
    }, [i18n]);

    return (<>{children}</>)
}

LanguageWrapper.propTypes = {
  children: PropTypes.node.isRequired
};

export default LanguageWrapper