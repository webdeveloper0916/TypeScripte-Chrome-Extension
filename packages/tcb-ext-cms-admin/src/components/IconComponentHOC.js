import React from 'react'
import Icon from '@material-ui/core/Icon'
// https://material.io/resources/icons/?style=baseline
// https://material-ui.com/zh/components/icons/#icon-font-icons
export default (icon) => (props) => {
  return <Icon>{icon ? icon : 'library_books'}</Icon>
}
