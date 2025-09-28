import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connection } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.username || !credentials.password) {
                        return null;
                    }

                    const [rows] = await connection.execute(
                        'SELECT * FROM users WHERE username = ?',
                        [credentials.username]
                    ) as [any[], any];
                    
                    if (rows.length === 0) {
                        return null;
                    }

                    const user = rows[0];
                    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
                    
                    if (!isValidPassword) {
                        return null;
                    }

                    // ✅ เพิ่มการอัพเดต last_seen และ activity log
                    const now = new Date();
                    await connection.execute(
                        'UPDATE users SET last_seen = ? WHERE id = ?',
                        [now, user.id]
                    );

                    await connection.execute(
                        'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
                        [user.id, 'login']
                    );

                    // ✅ ส่งข้อมูลที่จำเป็นเท่านั้น
                    return { 
                        id: user.id.toString(), 
                        name: user.username,
                        email: `${user.username}@local.app`,
                    };
                } catch (error) {
                    console.error('Authorization error:', error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/',
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }) {
            // ✅ เพิ่มข้อมูล user เข้า token ครั้งแรกที่ login
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            // ✅ ส่งข้อมูลจาก token ไปยัง session
            if (token && session.user) {
                (session.user as any).id = token.id;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                
                // ✅ อัพเดต last_seen ทุกครั้งที่มีการตรวจสอบ session
                try {
                    await connection.execute(
                        'UPDATE users SET last_seen = ? WHERE username = ?',
                        [new Date(), token.name]
                    );
                } catch (error) {
                    console.error('Error updating last_seen:', error);
                }
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};