# Projects at Huawei

## MyGOV AI Assistant
A government super-app POC for Malaysian citizens to check summonses, STR status and other agency services conversationally, with an AI chatbot that has governance controls, knowledge-based answers and tool calling. Ray was the sole builder of the POC-ready React app UI and presented the live demo; Huawei's Head of AI pitched the product stack. The bid reached the final round against AWS. The client chose AWS for cloud services but adopted Ray's UI, UX flow and design in their build — they lost on infrastructure, not on the solution.

## Water-treatment SCADA AI
For a government water-treatment plant, abnormal incidents arrive as floods of SCADA alarms that engineers traced by hand through sensor data and past incident reports. The solution is an AI root-cause-analysis (RCA) workflow built on Dify: multi-step workflows combine SCADA sensor data, alarm logs and historical incidents, use LLM + RAG to identify probable root causes, and recommend corrective actions to operators. Ray supported the solution and demoed it to the client. Goals: less manual troubleshooting, more accurate fault diagnosis and faster incident response.

## AmBank credit-paper AI
Relationship managers (RMs) at AmBank turn long credit papers into structured fields by hand, and the first version of the extraction pipeline reached only about 30% accuracy. Ray, as POC lead engineer, fine-tuned Qwen3 to read credit papers into RM-aligned markdown and extract L1, L2 and L3 values into the right fields per AmBank's standard, designed to run on limited hardware and GPU resources. Extraction accuracy rose from about 30% to 80% after he joined, and data matching exceeded 90% accuracy. He supported the sales closure with technical consultation and demos, and ran knowledge-transfer sessions and code walkthroughs for the client team.

## Internal sales intelligence platform (current)
Ray is the technical person-in-charge (his manager is the business PIC). He built an XGBoost win-rate prediction model trained on messy real sales data, with SHAP analysis surfacing the positive and negative drivers behind each deal. A knowledge graph unifies project reviews, strategy plans and targets, combining structured and unstructured data into one queryable model. A PD Agent chatbot recommends the next best move for each deal, and management gets automated chart generation, summarised insights and AI-driven risk identification.
