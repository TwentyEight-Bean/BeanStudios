import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/cai-dat/', '/ho-so/me'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://bean.studio'}/sitemap.xml`,
  }
}
