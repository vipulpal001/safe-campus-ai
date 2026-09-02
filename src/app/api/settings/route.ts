import { NextRequest, NextResponse } from 'next/server';
import {
  getUserSettings,
  updateUserSettings,
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '@/lib/data-store';

export async function GET() {
  try {
    const settings = await getUserSettings();
    const contacts = await getEmergencyContacts();
    return NextResponse.json({
      success: true,
      data: { settings, contacts },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings, contactAction, contactData } = body;

    if (settings) {
      await updateUserSettings(settings);
    }

    if (contactAction === 'add' && contactData) {
      await addEmergencyContact(contactData);
    } else if (contactAction === 'update' && contactData?.id) {
      await updateEmergencyContact(contactData.id, contactData);
    } else if (contactAction === 'delete' && contactData?.id) {
      await deleteEmergencyContact(contactData.id);
    }

    const updatedSettings = await getUserSettings();
    const updatedContacts = await getEmergencyContacts();

    return NextResponse.json({
      success: true,
      data: { settings: updatedSettings, contacts: updatedContacts },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
