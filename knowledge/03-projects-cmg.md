# Projects at CMG Technologies

## F&B service chatbot (WhatsApp)
Restaurants on CMG's F&B point-of-sale system were answering every WhatsApp message by hand. Ray's team built a customer-service agent that lives in WhatsApp and talks to the POS database directly. It detects order intent and fires a structured order template, reads the live menu straight from the database, follows SOP-driven recommendations (allergy checks always come first, for example ordering nasi lemak without peanuts), captures complaints and hands them to a human agent in one tap. A back-office console lets the customer-service team manage requests, and admins customise the bot's prompt themselves. The backend was TypeScript and Python with LLMs self-hosted on local GPU servers (Ollama, vLLM, llama.cpp).

## No-code agent builder
Once the first bots shipped, requests for AI came from every department. Ray's team built an internal platform where anyone can create a custom agent in a UI with no code: attach tools by pasting API links and defining their schemas, and build a separate knowledge base for each agent. RAG is powered by mastra-ai in TypeScript, drawing on earlier multi-agent work with LangGraph. Departments self-serve their own agents and the AI team focuses on the platform.

## Madam Kwan's mini program
Ray served on the full-stack team delivering Madam Kwan's customer mini program: menu browsing, pickup ordering, points, rewards and vouchers, and customer profiles, backed by a back office for the restaurant team. He did frontend and backend integration, built and maintained the back-office frontend in Next.js and React, led deployment and staging on Kubernetes, and optimised UI components for performance. Link: https://emp.cmg.com.my/home
