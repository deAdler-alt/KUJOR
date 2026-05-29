extends Interactable

@export var dialogue_json_path: String = "res://data/dialogues/trener.json"


func _ready() -> void:
	super._ready()
	prompt_text = "Naciśnij Z — rozmowa"


func _on_interact(_player: Node) -> void:
	var dialogue_id := _pick_dialogue_id()
	DialogueManager.start_from_json(dialogue_id, dialogue_json_path, _on_dialogue_end)


func _pick_dialogue_id() -> String:
	if GameState.has_flag("beat_140"):
		if GameState.all_items_collected():
			return "trener_golden_ending"
		return "trener_boss_win"
	if GameState.has_flag("met_trainer"):
		return _progress_dialogue()
	return "trener_intro"


func _progress_dialogue() -> String:
	var w := GameState.max_weight_unlocked
	if w >= 120:
		return "trener_before_boss"
	if w >= 100:
		return "trener_after_100"
	if w >= 80:
		return "trener_after_80"
	if w >= 60:
		return "trener_after_60"
	if w >= 40:
		return "trener_after_40"
	return "trener_reminder"


func _on_dialogue_end() -> void:
	if not GameState.has_flag("met_trainer"):
		GameState.set_flag("met_trainer", true)
