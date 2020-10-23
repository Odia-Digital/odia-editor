import React from 'react';

export default function Preview ({ content }) {
  return (
    <div className='preview' dangerouslySetInnerHTML={{ __html: content }} />
  );
}
