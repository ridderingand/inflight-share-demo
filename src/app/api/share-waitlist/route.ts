import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const AUDIENCE_ID = "7124030d-2d6b-4191-8763-2ecb19f05274";

export async function POST(req: NextRequest) {
	const { email } = await req.json();

	if (!email || typeof email !== "string") {
		return NextResponse.json({ error: "Email is required" }, { status: 400 });
	}

	if (!email.includes("@") || !email.includes(".")) {
		return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
	}

	const resend = new Resend(process.env.RESEND_API_KEY);

	const { error } = await resend.contacts.create({
		email,
		audienceId: AUDIENCE_ID,
	});

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
