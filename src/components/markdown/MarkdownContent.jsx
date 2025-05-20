import React from 'react';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

import { styled } from '@mui/material/styles';

// const MarkdownWrapper = styled('div')(({ theme }) => ({
//   '& p': {
//     marginBottom: theme.spacing(2),
//   },
//   '& a': {
//     color: theme.palette.primary.main,
//     textDecoration: 'none',
//     '&:hover': {
//       textDecoration: 'underline',
//     },
//   },
//   '& strong': {
//     fontWeight: 600,
//   },
//   '& em': {
//     fontStyle: 'italic',
//   },
//   '& ul, & ol': {
//     marginBottom: theme.spacing(2),
//     paddingLeft: theme.spacing(3),
//   },
//   '& li': {
//     marginBottom: theme.spacing(0.5),
//   },
//   '& img': {
//     maxWidth: '100%',
//     height: 'auto',
//   },
// }));

const MarkdownContent = ({ content }) => (
  <MarkdownWrapper>
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
      {content}
    </ReactMarkdown>
  </MarkdownWrapper>
);

export default MarkdownContent;

MarkdownContent.propTypes = {
  content: PropTypes.any,
};
