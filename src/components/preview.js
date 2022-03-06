import React from 'react';

export default function Preview ({ content }) {
  return (
    <div className='markdown-body' dangerouslySetInnerHTML={{ __html: content }} />
  );
}
