const files = require.context('./locale', false, /\.js$/)
const messages = {}

files
  .keys()
  .forEach(
    (key) => (messages[key.replace(/(\.\/|\.js)/g, '')] = files(key).default)
  )

const i18n = {
  locale: 'en',
  fallbackLocale: 'en',
  messages
}

export default i18n
