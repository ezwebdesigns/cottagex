'use client';

import React from 'react';

const shortcodeRegex = /\[(.+?),\s*(.+?)\]/;

function getAlignClass(textAlign?: string) {
  if (!textAlign) return '';
  switch (textAlign) {
    case 'center': return 'text-center';
    case 'right': return 'text-right';
    case 'justify': return 'text-justify';
    default: return 'text-left';
  }
}

function renderNode(node: any): React.ReactNode {
  if (!node) return '';

  switch (node.type) {
    case 'doc':
      return node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>);
    case 'paragraph':
      return <p className={getAlignClass(node.attrs?.textAlign)}>{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</p>;
    case 'heading': {
      const level = node.attrs?.level || 1;
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
      return <Tag className={getAlignClass(node.attrs?.textAlign)}>{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</Tag>;
    }
    case 'text': {
      const text = node.text || '';
      if (shortcodeRegex.test(text)) {
        const parts = text.split(shortcodeRegex);
        return parts.map((part: string, i: number) => {
          if (i % 3 === 0) {
            let formatted = part;
            if (node.marks) {
              node.marks.forEach((mark: any) => {
                if (mark.type === 'bold') formatted = `<strong>${formatted}</strong>`;
                if (mark.type === 'italic') formatted = `<em>${formatted}</em>`;
                if (mark.type === 'strike') formatted = `<s>${formatted}</s>`;
                if (mark.type === 'link') formatted = `<a href="${mark.attrs?.href}">${formatted}</a>`;
              });
            }
            return <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
          }
          if (i % 3 === 1) {
            return null;
          }
          return null;
        });
      }
      let formatted = text;
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          if (mark.type === 'bold') formatted = `<strong>${formatted}</strong>`;
          if (mark.type === 'italic') formatted = `<em>${formatted}</em>`;
          if (mark.type === 'strike') formatted = `<s>${formatted}</s>`;
          if (mark.type === 'link') formatted = `<a href="${mark.attrs?.href}">${formatted}</a>`;
        });
      }
      return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
    }
    case 'bulletList':
      return <ul>{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</ul>;
    case 'orderedList':
      return <ol>{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</ol>;
    case 'listItem':
      return <li>{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</li>;
    case 'image':
      return <img src={node.attrs?.src} alt={node.attrs?.alt || ''} loading="lazy" />;
    case 'table':
      return (
        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse border border-gray-200">
            <tbody>{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</tbody>
          </table>
        </div>
      );
    case 'tableRow':
      return <tr>{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</tr>;
    case 'tableHeader':
      return <th className="border border-gray-200 p-2 bg-gray-50 font-bold text-left">{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</th>;
    case 'tableCell':
      return <td className="border border-gray-200 p-2 text-left">{node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)}</td>;
    case 'hardBreak':
      return <br />;
    default:
      return node.content?.map((n: any, i: number) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>) || '';
  }
}

export function PageContent({ content }: { content: any }) {
  if (!content) return null;
  return <>{renderNode(content)}</>;
}
