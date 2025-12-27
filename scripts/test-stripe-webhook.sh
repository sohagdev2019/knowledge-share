#!/bin/bash

# Stripe Webhook Testing Script
# This script helps you test Stripe webhooks locally using Stripe CLI

echo "🔔 Stripe Webhook Testing Setup"
echo "================================"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed."
    echo ""
    echo "Please install it first:"
    echo "  macOS: brew install stripe/stripe-cli/stripe"
    echo "  Linux: See https://stripe.com/docs/stripe-cli"
    echo "  Windows: See https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "✅ Stripe CLI found"
echo ""

# Check if user is logged in to Stripe CLI
if ! stripe config --list &> /dev/null; then
    echo "⚠️  You need to login to Stripe CLI first"
    echo ""
    echo "Run: stripe login"
    exit 1
fi

echo "✅ Stripe CLI is configured"
echo ""

# Get the webhook endpoint URL
LOCAL_URL="http://localhost:3000/api/webhook/stripe"
echo "📡 Webhook endpoint: $LOCAL_URL"
echo ""

# Check if .env.local exists and has STRIPE_WEBHOOK_SECRET
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found"
    echo "   Creating .env.local template..."
    echo ""
    echo "STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx" >> .env.local
    echo "   Please add your webhook secret to .env.local"
    echo ""
fi

echo "🚀 Starting Stripe webhook forwarding..."
echo ""
echo "This will forward Stripe webhook events to: $LOCAL_URL"
echo ""
echo "Press Ctrl+C to stop"
echo ""
echo "=========================================="
echo ""

# Forward webhooks
stripe listen --forward-to $LOCAL_URL

